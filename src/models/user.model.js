import mongoose, {Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const userSchema = new Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email : {
        type : String,
        required : true,
        unique:true
    },
    avatar : {
        type : String,
        required : true
    },
    fullname : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required:[true, "password is required"],
    },
    refreshToken : {
        type : String,
    },
    role : {
        type : String,
        enum : ['admin', 'aesthetic_nurse', 'doctor', 'clinic_manager', 'receptionist'],// enum ensures that the value stored in that field must be one of the values specified in the enum array. This is particularly useful for fields that should only accept certain specific values, like user roles, categories, statuses, etc.
        required : true
    },
    permissions : {
        type : [String],
        default : []
    }
},{timestamps:true})

userSchema.pre('save', function(next){
    if(this.role==='admin'){
        this.permissions=['manage_users', 'manage_roles', 'view_all_records', 'system_settings']
    }else if(this.role==='aesthetic_nurse' || this.role==='doctor'){
        this.permissions = ['view_own_records', 'create_update_treatment_notes', 'access_patient_history', 'manage_prescriptions']
    }else if(this.role==='clinic_manager'){
        this.permissions = ['view_clinic_records', 'manage_staff_schedules', 'oversee_appointments', 'access_reports', 'handle_billing']
    }else if(this.role==='receptionist'){
        this.permissions = ['book_manage_appointments', 'send_reminders', 'access_basic_patient_info', 'handle_checkins_payments']
    }
    next()
})



export const User = mongoose.model("User", userSchema) 