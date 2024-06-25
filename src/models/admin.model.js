import mongoose, { Schema } from 'mongoose';
import { User } from './user.model.js';

const adminSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    adminLevel: { type: String, required: true }, // Example additional field
    permissions: [{ type: String, required: true }]
}, { timestamps: true });

adminSchema.pre('save', async function(next) {
    // Ensure that the user's role is set to 'admin'
    const user = await User.findById(this.user);
    if (user && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
    }
    next();
});

adminSchema.methods.updatePermissions = function(newPermissions) {
    this.permissions = newPermissions;
    return this.save();
};

export const Admin = mongoose.model('Admin', adminSchema);
