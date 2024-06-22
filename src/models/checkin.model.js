import mongoose, { Schema } from 'mongoose';

const checkinSchema = new Schema({
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, required: true },
}, { timestamps: true });

export const Checkin = mongoose.model('Checkin', checkinSchema);
