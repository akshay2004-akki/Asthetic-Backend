import mongoose, { Schema } from 'mongoose';

const billingSchema = new Schema({
    patient: { 
        type: Schema.Types.ObjectId, 
        ref: 'Patient', 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    details: { 
        type: String, 
        required: true 
    },
    date: { 
        type: Date, 
        required: true 
    },
}, { timestamps: true });

export const Billing = mongoose.model('Billing', billingSchema);
