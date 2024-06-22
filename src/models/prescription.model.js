import mongoose, { Schema } from 'mongoose';

const prescriptionSchema = new Schema({
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    medications: [{ name: String, dosage: String, instructions: String }],
    date: { type: Date, required: true },
}, { timestamps: true });

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
