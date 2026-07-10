import mongoose from 'mongoose';                                                      // ORM para MongoDB

const vademecumSchema = new mongoose.Schema(
  {
    companyId: { type: String,                         required: true },              // aislamiento multi-tenant — mismo formato String que User.js y Company.js
    title:     { type: String,                         required: true, trim: true },  // título del artículo, sin espacios sobrantes
    category:  {                                                                       // categoría para agrupar artículos en el frontend
      type:    String,
      enum:    ['Procedures', 'Policies', 'Emergency', 'Guides'],                     // valores permitidos
      default: 'Guides',                                                              // categoría por defecto
    },
    content:   { type: String,                         required: true },              // cuerpo del artículo en formato Markdown
    isPinned:  { type: Boolean,                        default: false },              // artículos fijados aparecen primero en la lista
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // referencia al admin que creó el artículo
  },
  { timestamps: true }                                                                // añade createdAt y updatedAt automáticamente
);

vademecumSchema.index({ companyId: 1, isPinned: -1, updatedAt: -1 }); // índice compuesto para la query de listado (ordenada por pin y fecha)

export default mongoose.model('Vademecum', vademecumSchema);           // exporta el modelo listo para importar en las rutas
