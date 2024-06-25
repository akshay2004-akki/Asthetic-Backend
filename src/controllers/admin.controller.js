import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'

// Admin permissions
const manageUsers = asyncHandler(async (req, res) => {
    // TODO: Implement user management logic (e.g., create, update, delete users)
    
});

const manageRoles = asyncHandler(async (req, res) => {
    // TODO: Implement role management logic (e.g., assign roles, update roles)
    const {username, updateRole} = req.body;
    if(!username || !updateRole){
        throw new ApiError(404,"User name required")
    }

    try {
        const user = await User.findOne({username}).select("-password -refreshToken")
        const roleInLowercase = updateRole.toLocaleLowerCase()

        user.role = roleInLowercase;
        
        if (roleInLowercase === 'admin') {
            user.permissions = ['manage_users', 'manage_roles', 'view_all_records', 'system_settings'];
        } else if (roleInLowercase === 'aesthetic_nurse' || roleInLowercase === 'doctor') {
            user.permissions = ['view_own_records', 'create_update_treatment_notes', 'access_patient_history', 'manage_prescriptions'];
        } else if (roleInLowercase === 'clinic_manager') {
            user.permissions = ['view_clinic_records', 'manage_staff_schedules', 'oversee_appointments', 'access_reports', 'handle_billing'];
        } else if (roleInLowercase === 'receptionist') {
            user.permissions = ['book_manage_appointments', 'send_reminders', 'access_basic_patient_info', 'handle_checkins_payments'];
        } else if (roleInLowercase === 'patient') {
            user.permissions = ['view_own_records', 'book_appointments', 'update_personal_info', 'view_prescriptions'];
        }

        await user.save()
        return res.status(200).json(new ApiResponse(200,user,"Role Updated successfully"))
    } catch (error) {
        throw new ApiError(500,error?.message)
    }


});

const viewStaffRecords = asyncHandler(async (req, res) => {
    // TODO: Implement logic to view all records (e.g., retrieve all user records)
    const user = req.user; // Assuming req.user contains the logged-in user's data

    if (user.role !== 'admin' && user.role !== 'clinic_manager') {
        throw new ApiError(403, "You do not have permission to view all records");
    }

    try {
        const users = await User.find().select("-password -refreshToken");
        return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
    } catch (error) {
        throw new ApiError(500, error.message);
    }

    
});

const systemSettings = asyncHandler(async (req, res) => {
    // TODO: Implement system settings management logic (e.g., update configuration settings)
    
});
export {
    manageUsers,
    manageRoles,
    viewStaffRecords,
    systemSettings
}