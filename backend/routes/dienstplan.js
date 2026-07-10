import express       from 'express';                                           // framework de rutas
import { requireAuth } from '../middleware/auth.js';                          // middleware que valida JWT y popula req.userId, req.companyId, req.role, req.scope
import ScheduleEntry from '../models/ScheduleEntry.js';                       // modelo de entradas del plan de turnos
import User          from '../models/User.js';                                // modelo de usuarios (para devolver la lista con el GET)

const router = express.Router();                                              // instancia de router de Express

router.use(requireAuth);                                                      // todas las rutas requieren JWT válido

// ─── GET /day?date=YYYY-MM-DD — plan de un día concreto (todos los usuarios autenticados) ─
router.get('/day', async (req, res) => {                                      // endpoint para la vista diaria con detalle de bloques
  try {
    const { date } = req.query;                                               // parámetro obligatorio en formato YYYY-MM-DD
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {                        // valida que venga en el formato correcto
      return res.status(400).json({ error: 'Param date required (YYYY-MM-DD)' }); // rechaza requests malformados
    }

    const entries = await req.scope                                           // filtra automáticamente por companyId
      .find(ScheduleEntry, { date })                                          // entradas del día exacto
      .lean();                                                                // plain JS objects — más rápido para serializar

    const users = await req.scope                                             // todos los empleados de la empresa
      .find(User)                                                             // filtra automáticamente por companyId
      .select('_id name initials color role dept')                            // solo los campos necesarios para pintar la vista
      .sort({ name: 1 })                                                      // orden alfabético
      .lean();                                                                // plain JS objects

    res.json({ entries, users });                                             // devuelve entradas y empleados para el día
  } catch (err) {
    console.error(err);                                                       // registra el error en el log del servidor
    res.status(500).json({ error: 'Server error' });                          // responde con error genérico
  }
});

// ─── GET /?month=YYYY-MM — plan del mes completo (todos los usuarios autenticados) ─
router.get('/', async (req, res) => {                                         // cualquier usuario autenticado puede leer el plan
  try {
    const { month } = req.query;                                              // parámetro obligatorio en formato YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {                            // valida que venga en el formato correcto
      return res.status(400).json({ error: 'Param month required (YYYY-MM)' }); // rechaza requests malformados
    }

    const entries = await req.scope                                           // filtra automáticamente por companyId
      .find(ScheduleEntry, { date: { $regex: `^${month}` } })               // todas las entradas del mes usando prefijo de fecha
      .lean();                                                                // plain JS objects — más rápido para serializar

    const users = await req.scope                                             // todos los empleados de la empresa
      .find(User)                                                             // filtra automáticamente por companyId
      .select('_id name initials color role dept')                            // solo los campos necesarios para pintar el grid
      .sort({ name: 1 })                                                      // orden alfabético para presentación consistente
      .lean();                                                                // plain JS objects

    res.json({ entries, users });                                             // devuelve ambas colecciones en un solo request
  } catch (err) {
    console.error(err);                                                       // registra el error en el log del servidor
    res.status(500).json({ error: 'Server error' });                          // responde con error genérico
  }
});

// ─── PUT / — crear o actualizar una entrada (upsert, solo admin) ─────────────
router.put('/', async (req, res) => {                                         // endpoint restringido a administradores
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin only' }); // rechaza cualquier rol que no sea admin
  try {
    const { userId, date, status, workType, notes, tasks } = req.body;       // extrae los campos del body, incluyendo bloques de trabajo
    if (!userId || !date || !status) {                                        // valida los campos obligatorios
      return res.status(400).json({ error: 'userId, date and status are required' }); // mensaje claro de validación
    }

    const rawTasks = Array.isArray(tasks) ? tasks : [];                       // normaliza: asegura que tasks sea array

    if (status !== 'work' && rawTasks.length > 0) {                          // bloques de trabajo solo aplican cuando se trabaja
      return res.status(400).json({ error: 'tasks must be empty when status is not work' }); // rechaza datos inconsistentes
    }

    for (const t of rawTasks) {                                               // valida cada bloque de trabajo individualmente
      if (!t.startTime || !t.endTime || !t.title) {                           // startTime, endTime y title son obligatorios
        return res.status(400).json({ error: 'Each task requires startTime, endTime and title' }); // mensaje claro
      }
      if (t.endTime <= t.startTime) {                                         // endTime debe ser estrictamente mayor que startTime
        return res.status(400).json({ error: `Task "${t.title}": endTime must be after startTime` }); // detalla cuál bloque falla
      }
    }

    const entry = await req.scope.findOneAndUpdate(                           // upsert: crea si no existe, actualiza si ya existe
      ScheduleEntry,                                                          // modelo sobre el que opera
      { userId, date },                                                       // filtro — companyId se inyecta automáticamente por tenantScope
      { $set: {                                                               // campos a actualizar
          status,                                                             // estado del día: work / free / vacation / sick
          tasks:    rawTasks,                                                  // array de bloques de trabajo con horario
          workType: workType || '',                                            // fallback legacy — se conserva para compatibilidad
          notes:    notes    || '',                                            // notas opcionales
          createdBy: req.userId,                                              // id del admin que realiza el cambio
      }},
      { upsert: true, new: true, runValidators: true }                        // upsert: inserta si no existe; new: devuelve el doc actualizado
    );

    res.json(entry);                                                          // devuelve el documento creado o actualizado
  } catch (err) {
    console.error(err);                                                       // registra el error en el log del servidor
    res.status(500).json({ error: 'Server error' });                          // responde con error genérico
  }
});

// ─── DELETE /?userId=...&date=... — eliminar una entrada (solo admin) ────────
router.delete('/', async (req, res) => {                                      // endpoint restringido a administradores
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin only' }); // rechaza cualquier rol que no sea admin
  try {
    const { userId, date } = req.query;                                       // parámetros en query string
    if (!userId || !date) {                                                   // valida que ambos parámetros estén presentes
      return res.status(400).json({ error: 'userId and date are required' }); // mensaje claro de validación
    }

    const deleted = await ScheduleEntry.findOneAndDelete({                    // raw query — tenantScope no tiene findOneAndDelete por filtro arbitrario
      companyId: req.companyId,                                               // SIEMPRE se filtra por companyId para garantizar aislamiento
      userId,                                                                 // id del empleado
      date,                                                                   // fecha en formato YYYY-MM-DD
    });

    if (!deleted) return res.status(404).json({ error: 'Entry not found' }); // la celda ya estaba vacía
    res.json({ message: 'Deleted' });                                         // confirmación de eliminación
  } catch (err) {
    console.error(err);                                                       // registra el error en el log del servidor
    res.status(500).json({ error: 'Server error' });                          // responde con error genérico
  }
});

export default router;                                                        // exporta el router para registrarlo en server.js
