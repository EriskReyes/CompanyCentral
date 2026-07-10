import express    from 'express';                                          // framework de rutas
import { requireAuth } from '../middleware/auth.js';                       // middleware que valida JWT y popula req.userId, req.companyId, req.role, req.scope
import Vademecum   from '../models/Vademecum.js';                          // modelo Mongoose del vademecum

const router = express.Router();                                           // instancia de router de Express

router.use(requireAuth);                                                   // todas las rutas requieren JWT válido

// ─── GET / — listar todos los artículos de la empresa ────────────────────────
router.get('/', async (req, res) => {                                      // endpoint público para usuarios autenticados
  try {
    const articles = await req.scope.find(Vademecum)                       // filtra automáticamente por companyId
      .sort({ isPinned: -1, updatedAt: -1 })                               // fijados primero, luego por fecha más reciente
      .populate('createdBy', 'name initials color');                       // trae nombre e iniciales del autor sin exponer datos sensibles
    res.json(articles);                                                    // devuelve array de artículos
  } catch (err) {
    console.error(err);                                                    // registra el error en el log del servidor
    res.status(500).json({ error: 'Server error' });                       // responde con error genérico para no exponer detalles internos
  }
});

// ─── POST / — crear un nuevo artículo (solo admin) ───────────────────────────
router.post('/', async (req, res) => {                                     // endpoint restringido a administradores
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin only' }); // rechaza cualquier rol que no sea admin
  try {
    const { title, category, content, isPinned } = req.body;              // extrae únicamente los campos permitidos del body
    const article = await req.scope.create(Vademecum, {                   // crea el documento inyectando companyId automáticamente
      title,                                                               // título del artículo
      category,                                                            // categoría: Procedures, Policies, Emergency o Guides
      content,                                                             // cuerpo en Markdown
      isPinned: isPinned ?? false,                                         // si no se envía, queda sin fijar
      createdBy: req.userId,                                               // referencia al usuario admin que crea el artículo
    });
    res.status(201).json(article);                                         // 201 Created con el documento recién creado
  } catch (err) {
    console.error(err);                                                    // registra el error en el log del servidor
    res.status(500).json({ error: 'Server error' });                       // responde con error genérico
  }
});

// ─── PUT /:id — editar un artículo (solo admin) ──────────────────────────────
router.put('/:id', async (req, res) => {                                   // endpoint para actualizar un artículo por su _id
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin only' }); // rechaza cualquier rol que no sea admin
  try {
    const { title, category, content, isPinned } = req.body;              // extrae solo los campos editables
    const updated = await req.scope.findByIdAndUpdate(                     // filtra por _id Y companyId (tenantScope lo garantiza)
      Vademecum,                                                           // modelo sobre el que opera
      req.params.id,                                                       // _id del artículo a editar
      { $set: { title, category, content, isPinned } },                   // solo sobreescribe los campos enviados
      { new: true, runValidators: true }                                   // devuelve el documento actualizado y valida el schema
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });    // el artículo no existe o pertenece a otra empresa
    res.json(updated);                                                     // devuelve el artículo actualizado
  } catch (err) {
    console.error(err);                                                    // registra el error en el log del servidor
    res.status(500).json({ error: 'Server error' });                       // responde con error genérico
  }
});

// ─── DELETE /:id — eliminar un artículo (solo admin) ─────────────────────────
router.delete('/:id', async (req, res) => {                               // endpoint para eliminar un artículo por su _id
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin only' }); // rechaza cualquier rol que no sea admin
  try {
    const deleted = await req.scope.findByIdAndDelete(                     // filtra por _id Y companyId (tenantScope lo garantiza)
      Vademecum,                                                           // modelo sobre el que opera
      req.params.id                                                        // _id del artículo a eliminar
    );
    if (!deleted) return res.status(404).json({ error: 'Not found' });    // el artículo no existe o pertenece a otra empresa
    res.json({ message: 'Deleted' });                                      // confirmación de eliminación
  } catch (err) {
    console.error(err);                                                    // registra el error en el log del servidor
    res.status(500).json({ error: 'Server error' });                       // responde con error genérico
  }
});

export default router;                                                     // exporta el router para registrarlo en server.js
