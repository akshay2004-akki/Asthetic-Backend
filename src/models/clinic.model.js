import mongoose, { Schema } from 'mongoose';

const clinicSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    contactInfo: { type: String, required: true },
    staff: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    patients: [{ type: Schema.Types.ObjectId, ref: 'Patient' }],
}, { timestamps: true });

export const Clinic = mongoose.model('Clinic', clinicSchema);
