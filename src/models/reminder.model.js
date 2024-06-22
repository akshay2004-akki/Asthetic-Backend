import mongoose, { Schema } from 'mongoose';

const reminderSchema = new Schema({
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    message: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, required: true },
}, { timestamps: true });

export const Reminder = mongoose.model('Reminder', reminderSchema);
