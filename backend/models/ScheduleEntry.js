import mongoose from 'mongoose';                                              // ORM para MongoDB

const taskSchema = new mongoose.Schema(                                        // subdocumento para un bloque de trabajo dentro del día
  {
    startTime: { type: String, required: true },                               // inicio del bloque en formato HH:mm
    endTime:   { type: String, required: true },                               // fin del bloque en formato HH:mm — debe ser mayor que startTime
    title:     { type: String, required: true, trim: true },                   // nombre descriptivo del bloque de trabajo
    notes:     { type: String, default: '' },                                  // notas opcionales del bloque
  },
  { _id: false }                                                               // sin _id propio — se identifica por posición en el array
);

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
    tasks:     { type: [taskSchema], default: [] },                            // bloques de trabajo con horario — solo aplica cuando status === 'work'
    workType:  { type: String, default: '' },                                  // fallback legacy — reemplazado por tasks, se conserva para datos existentes
    notes:     { type: String, default: '' },                                 // notas opcionales visibles en el modal
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },        // admin que creó o modificó la entrada
  },
  { timestamps: true }                                                         // añade createdAt y updatedAt automáticamente
);

// Índice único compuesto — nunca puede existir dos entradas de la misma persona el mismo día en la misma empresa
scheduleEntrySchema.index({ companyId: 1, userId: 1, date: 1 }, { unique: true });

export default mongoose.model('ScheduleEntry', scheduleEntrySchema);           // exporta el modelo listo para importar en la ruta
