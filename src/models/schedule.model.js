import mongoose, { Schema } from 'mongoose';

const scheduleSchema = new Schema({
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    day: { type: String, required: true },
    timeSlots: [{ startTime: String, endTime: String, booked: Boolean }],
}, { timestamps: true });

export const Schedule = mongoose.model('Schedule', scheduleSchema);
