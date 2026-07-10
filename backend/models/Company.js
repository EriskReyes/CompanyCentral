import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  companyId: { type: String, unique: true, required: true },
  name:      { type: String, required: true },
  industry:  { type: String, required: true },
  adminId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plan:      { type: String, default: 'free' },
}, { timestamps: true });

export default mongoose.model('Company', companySchema);
