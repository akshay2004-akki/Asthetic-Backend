import mongoose, { Schema } from 'mongoose';

const treatmentNoteSchema = new Schema({
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    notes: { type: String, required: true },
    date: { type: Date, required: true },
}, { timestamps: true });

export const TreatmentNote = mongoose.model('TreatmentNote', treatmentNoteSchema);
