import mongoose, { Schema } from 'mongoose';

const reportSchema = new Schema({
    type: { type: String, required: true },
    details: { type: String, required: true },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
}, { timestamps: true });

export const Report = mongoose.model('Report', reportSchema);
