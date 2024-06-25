import mongoose, { Schema } from 'mongoose';

const doctorSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    specialization: { 
        type: String, 
        required: true 
    },
    contactInfo: { 
        type: String, 
        required: true 
    },
    schedules: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Schedule' 
    }],
    appointments: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Appointment' 
    }],
    patients : [{
        type: Schema.Types.ObjectId, 
        ref: 'Patient'
    }]
}, { timestamps: true });

export const Doctor = mongoose.model('Doctor', doctorSchema);
