import mongoose, { Schema } from 'mongoose';

const appointmentSchema = new Schema({
    patient: { 
        type: Schema.Types.ObjectId, 
        ref: 'Patient', 
        required: true 
    },
    doctor: { 
        type: Schema.Types.ObjectId, 
        ref: 'Doctor', 
        required: true  
    },
    date: { 
        type: Date, 
        required: true 
    },
    time: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        required: true 
    },
    notes: String,
}, { timestamps: true });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
