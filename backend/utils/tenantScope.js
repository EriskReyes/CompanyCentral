// Central query helper — ALL database queries must go through here.
// Controllers receive req.scope from auth middleware; calling Model.find() directly is prohibited.
export function createScope(companyId) {
  if (!companyId) throw new Error('tenantScope: companyId is required');

  return {
    find:              (Model, filter = {})              => Model.find({ ...filter, companyId }),
    findOne:           (Model, filter = {})              => Model.findOne({ ...filter, companyId }),
    findById:          (Model, id)                       => Model.findOne({ _id: id, companyId }),
    create:            (Model, data)                     => Model.create({ ...data, companyId }),
    findByIdAndUpdate: (Model, id, update, opts = {})    => Model.findOneAndUpdate({ _id: id, companyId }, update, { new: true, ...opts }),
    findOneAndUpdate:  (Model, filter, update, opts = {}) => Model.findOneAndUpdate({ ...filter, companyId }, update, { new: true, ...opts }),
    findByIdAndDelete: (Model, id)                       => Model.findOneAndDelete({ _id: id, companyId }),
    count:             (Model, filter = {})              => Model.countDocuments({ ...filter, companyId }),
  };
}
