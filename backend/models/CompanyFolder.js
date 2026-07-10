import mongoose from 'mongoose';                                              // ORM para MongoDB

const companyFolderSchema = new mongoose.Schema(
  {
    companyId: { type: String,                         required: true },       // aislamiento multi-tenant — String igual que los demás modelos
    name:      { type: String,                         required: true, trim: true }, // nombre de la carpeta visible en UI
    color:     { type: String,                         default: '#6b7a8d' },   // color de acento para el icono de la carpeta
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },         // admin que creó la carpeta
  },
  { timestamps: true }                                                          // añade createdAt y updatedAt automáticamente
);

companyFolderSchema.index({ companyId: 1, createdAt: -1 });                    // índice para listados por empresa ordenados por fecha

export default mongoose.model('CompanyFolder', companyFolderSchema);           // exporta el modelo listo para importar en la ruta
