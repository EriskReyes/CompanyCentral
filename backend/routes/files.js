import express       from 'express';                                           // framework de rutas
import multer        from 'multer';                                             // middleware para subir archivos multipart/form-data
import { requireAuth } from '../middleware/auth.js';                           // middleware JWT — popula req.userId, req.companyId, req.role, req.scope
import CompanyFile   from '../models/CompanyFile.js';                          // modelo de archivos subidos
import CompanyFolder from '../models/CompanyFolder.js';                        // modelo de carpetas
import User          from '../models/User.js';                                 // modelo de usuario — para populate del uploader

const router  = express.Router();                                              // instancia de router de Express
const upload  = multer({                                                       // multer con almacenamiento en memoria — el buffer se guarda en MongoDB
  storage: multer.memoryStorage(),                                             // no toca el disco, usa RAM temporalmente
  limits:  { fileSize: 10 * 1024 * 1024 },                                    // límite de 10 MB por archivo para no superar el límite de 16 MB de MongoDB
});

router.use(requireAuth);                                                       // todas las rutas requieren JWT válido

// ─── GET /folders — listar carpetas de la empresa con conteo de archivos ─────
router.get('/folders', async (req, res) => {                                   // cualquier usuario autenticado puede leer carpetas
  try {
    const folders = await req.scope                                            // filtra automáticamente por companyId
      .find(CompanyFolder)                                                     // todas las carpetas de la empresa
      .sort({ createdAt: 1 })                                                  // orden cronológico de creación
      .lean();                                                                 // plain JS objects para serializar más rápido

    const counts = await CompanyFile.aggregate([                               // cuenta archivos por carpeta en un solo query
      { $match: { companyId: req.companyId } },                               // solo archivos de esta empresa — companyId es String
      { $group: { _id: '$folderId', count: { $sum: 1 } } },                   // agrupa por folderId y cuenta
    ]);

    const countMap = {};                                                       // convierte el resultado del aggregate a un mapa folderId → count
    counts.forEach(c => { countMap[String(c._id)] = c.count; });              // String() maneja null → "null" para la raíz

    const withCount = folders.map(f => ({                                      // añade el conteo a cada carpeta
      ...f,                                                                    // todos los campos del documento
      fileCount: countMap[String(f._id)] || 0,                                // 0 si la carpeta no tiene archivos
    }));

    const rootCount = countMap['null'] || 0;                                  // archivos sin carpeta (en la raíz)

    res.json({ folders: withCount, rootCount });                               // devuelve carpetas + conteo en raíz
  } catch (err) {
    console.error(err);                                                        // registra el error en el log del servidor
    res.status(500).json({ error: 'Server error' });                           // responde con error genérico
  }
});

// ─── POST /folders — crear una carpeta nueva (solo admin) ────────────────────
router.post('/folders', async (req, res) => {                                  // endpoint restringido a administradores
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin only' }); // rechaza roles que no sean admin
  try {
    const { name, color } = req.body;                                          // extrae nombre y color opcional
    if (!name?.trim()) return res.status(400).json({ error: 'name is required' }); // nombre obligatorio
    const folder = await req.scope.create(CompanyFolder, {                     // inyecta companyId automáticamente
      name:      name.trim(),                                                  // nombre de la carpeta sin espacios extra
      color:     color || '#6b7a8d',                                           // color de acento — por defecto gris
      createdBy: req.userId,                                                   // admin que creó la carpeta
    });
    res.status(201).json(folder);                                              // 201 Created con la carpeta recién creada
  } catch (err) {
    console.error(err);                                                        // registra el error en el log del servidor
    res.status(500).json({ error: 'Server error' });                           // responde con error genérico
  }
});

// ─── DELETE /folders/:id — eliminar carpeta y todos sus archivos (solo admin) ─
router.delete('/folders/:id', async (req, res) => {                            // endpoint restringido a administradores
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin only' }); // rechaza roles que no sean admin
  try {
    const folder = await req.scope.findById(CompanyFolder, req.params.id);    // busca la carpeta filtrando por _id Y companyId
    if (!folder) return res.status(404).json({ error: 'Folder not found' });  // la carpeta no existe o pertenece a otra empresa
    await CompanyFile.deleteMany({ companyId: req.companyId, folderId: folder._id }); // elimina todos los archivos de la carpeta
    await req.scope.findByIdAndDelete(CompanyFolder, req.params.id);          // elimina la carpeta
    res.json({ message: 'Folder and its files deleted' });                    // confirmación de eliminación
  } catch (err) {
    console.error(err);                                                        // registra el error en el log del servidor
    res.status(500).json({ error: 'Server error' });                           // responde con error genérico
  }
});

// ─── GET / — listar archivos (sin campo data para mantener respuesta ligera) ──
router.get('/', async (req, res) => {                                          // cualquier usuario autenticado puede ver la lista
  try {
    const { folderId } = req.query;                                            // filtro opcional por carpeta
    const filter = folderId === 'root'                                         // 'root' significa archivos sin carpeta
      ? { folderId: null }                                                     // sin carpeta asignada
      : folderId                                                               // si se pasa un id de carpeta válido
        ? { folderId }                                                         // filtra por esa carpeta
        : {};                                                                  // sin filtro — devuelve todos los archivos

    const files = await req.scope                                              // filtra automáticamente por companyId
      .find(CompanyFile, filter)                                               // archivos según el filtro de carpeta
      .select('-data')                                                         // excluye el campo data (binario) para respuesta ligera
      .sort({ createdAt: -1 })                                                 // más recientes primero
      .populate('uploadedBy', 'name initials color')                           // datos del usuario que subió el archivo
      .populate('folderId', 'name color')                                      // datos de la carpeta padre
      .lean();                                                                 // plain JS objects

    res.json(files);                                                           // devuelve array de metadatos de archivos
  } catch (err) {
    console.error(err);                                                        // registra el error en el log del servidor
    res.status(500).json({ error: 'Server error' });                           // responde con error genérico
  }
});

// ─── POST / — subir uno o varios archivos (solo admin) ───────────────────────
router.post('/', upload.array('files', 20), async (req, res) => {             // acepta hasta 20 archivos en el campo 'files'
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin only' }); // rechaza roles que no sean admin
  try {
    if (!req.files || req.files.length === 0) {                               // multer popula req.files con los archivos subidos
      return res.status(400).json({ error: 'No files received' });            // rechaza si no viene ningún archivo
    }

    const { folderId } = req.body;                                             // carpeta destino (opcional)

    const created = await Promise.all(req.files.map(f =>                       // crea un documento por cada archivo subido
      req.scope.create(CompanyFile, {                                          // inyecta companyId automáticamente
        folderId:   folderId || null,                                          // null = raíz si no se especifica carpeta
        name:       f.originalname,                                            // nombre original del archivo del usuario
        mimetype:   f.mimetype,                                                // Content-Type detectado por multer
        size:       f.size,                                                    // tamaño en bytes
        data:       f.buffer,                                                  // contenido binario en memoria (memoryStorage)
        uploadedBy: req.userId,                                                // admin que realizó la subida
      })
    ));

    const ids = created.map(f => f._id);                                      // IDs de los documentos creados
    const result = await CompanyFile.find({ _id: { $in: ids } })              // recarga sin campo data
      .select('-data')                                                         // excluye binario para respuesta ligera
      .populate('uploadedBy', 'name initials color')                          // datos del uploader
      .lean();                                                                 // plain JS objects

    res.status(201).json(result);                                              // 201 Created con metadatos de los archivos subidos
  } catch (err) {
    console.error(err);                                                        // registra el error en el log del servidor
    res.status(500).json({ error: err.message || 'Server error' });           // incluye mensaje para errores de límite de tamaño
  }
});

// ─── GET /:id/download — descargar o previsualizar un archivo ────────────────
router.get('/:id/download', async (req, res) => {                              // cualquier usuario autenticado puede descargar
  try {
    const file = await req.scope.findById(CompanyFile, req.params.id);        // busca el archivo filtrando por _id Y companyId
    if (!file) return res.status(404).json({ error: 'File not found' });      // no existe o pertenece a otra empresa

    const inline = req.query.inline === 'true';                               // inline=true para previsualizar en el navegador
    const disp   = inline                                                      // Content-Disposition controla si se abre o descarga
      ? `inline; filename="${file.name}"`                                      // inline: el navegador intenta mostrarlo
      : `attachment; filename="${file.name}"`;                                 // attachment: fuerza la descarga

    res.set('Content-Type',        file.mimetype);                            // tipo MIME original para que el navegador lo interprete
    res.set('Content-Disposition', disp);                                     // inline o attachment según el parámetro
    res.set('Content-Length',      file.size);                                // tamaño en bytes para la barra de progreso del navegador
    res.send(file.data);                                                       // envía el buffer binario al cliente
  } catch (err) {
    console.error(err);                                                        // registra el error en el log del servidor
    res.status(500).json({ error: 'Server error' });                           // responde con error genérico
  }
});

// ─── DELETE /:id — eliminar un archivo (solo admin) ──────────────────────────
router.delete('/:id', async (req, res) => {                                    // endpoint restringido a administradores
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin only' }); // rechaza roles que no sean admin
  try {
    const deleted = await req.scope.findByIdAndDelete(CompanyFile, req.params.id); // filtra por _id Y companyId
    if (!deleted) return res.status(404).json({ error: 'File not found' });   // no existe o pertenece a otra empresa
    res.json({ message: 'Deleted' });                                          // confirmación de eliminación
  } catch (err) {
    console.error(err);                                                        // registra el error en el log del servidor
    res.status(500).json({ error: 'Server error' });                           // responde con error genérico
  }
});

export default router;                                                         // exporta el router para registrarlo en server.js
