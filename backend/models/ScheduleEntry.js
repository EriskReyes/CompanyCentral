import mongoose from 'mongoose';                                              // ORM para MongoDB

const scheduleEntrySchema = new mongoose.Schema(
  {
    companyId: { type: String,                         required: true },       // aislamiento multi-tenant — String igual que User.js y Company.js
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // referencia al empleado dueño del día
    date:      { type: String,                         required: true },       // formato 'YYYY-MM-DD' — un documento por persona por día
    status:    {                                                               // estado del día laboral
      type:    String,
      enum:    ['work', 'free', 'vacation', 'sick'],                          // valores válidos
      required: true,                                                          // obligatorio en todo documento
    },
    workType:  { type: String, default: '' },                                 // descripción del trabajo, relevante solo cuando status === 'work'
    notes:     { type: String, default: '' },                                 // notas opcionales visibles en el modal
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },        // admin que creó o modificó la entrada
  },
  { timestamps: true }                                                         // añade createdAt y updatedAt automáticamente
);

// Índice único compuesto — nunca puede existir dos entradas de la misma persona el mismo día en la misma empresa
scheduleEntrySchema.index({ companyId: 1, userId: 1, date: 1 }, { unique: true });

export default mongoose.model('ScheduleEntry', scheduleEntrySchema);           // exporta el modelo listo para importar en la ruta
