import mongoose, { Schema } from 'mongoose';

const patientSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    medicalHistory: { 
        type: String, 
        required: true 
    },
    appointments: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Appointment' 
    }],
}, { timestamps: true });

export const Patient = mongoose.model('Patient', patientSchema);
