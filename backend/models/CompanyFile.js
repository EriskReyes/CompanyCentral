import mongoose from 'mongoose';                                              // ORM para MongoDB

const companyFileSchema = new mongoose.Schema(
  {
    companyId:  { type: String,                         required: true },      // aislamiento multi-tenant
    folderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyFolder', default: null }, // carpeta padre (null = raíz)
    name:       { type: String,                         required: true, trim: true }, // nombre original del archivo
    mimetype:   { type: String,                         required: true },      // Content-Type del archivo original
    size:       { type: Number,                         required: true },      // tamaño en bytes
    data:       { type: Buffer,                         required: true },      // contenido binario del archivo
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },        // usuario que subió el archivo
  },
  { timestamps: true }                                                          // añade createdAt y updatedAt automáticamente
);

// Índice para listar archivos de una carpeta ordenados por fecha
companyFileSchema.index({ companyId: 1, folderId: 1, createdAt: -1 });

export default mongoose.model('CompanyFile', companyFileSchema);               // exporta el modelo listo para importar en la ruta
