import mongoose, {Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config({
    path:"./.env"
})

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
        enum : ['admin', 'aesthetic_nurse', 'doctor', 'clinic_manager', 'receptionist', 'patient'],// enum ensures that the value stored in that field must be one of the values specified in the enum array. This is particularly useful for fields that should only accept certain specific values, like user roles, categories, statuses, etc.
        required : true
    },
    permissions : {
        type : [String],
        default : []
    }
},{timestamps:true})

userSchema.pre('save', async function(next){

    //password encryption
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);


    if(this.role==='admin'){
        this.permissions=['manage_users', 'manage_roles', 'view_all_records', 'system_settings']
    }else if(this.role==='aesthetic_nurse' || this.role==='doctor'){
        this.permissions = ['view_own_records', 'create_update_treatment_notes', 'access_patient_history', 'manage_prescriptions']
    }else if(this.role==='clinic_manager'){
        this.permissions = ['view_clinic_records', 'manage_staff_schedules', 'oversee_appointments', 'access_reports', 'handle_billing']
    }else if(this.role==='receptionist'){
        this.permissions = ['book_manage_appointments', 'send_reminders', 'access_basic_patient_info', 'handle_checkins_payments']
    }else if (this.role === 'patient') {
        this.permissions = ['view_own_records', 'book_appointments', 'update_personal_info', 'view_prescriptions']; // Added permissions for 'patient'
    }
    next()
})

// userSchema.pre("save", async function(next){
    
// })

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}
userSchema.methods.getAccessToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
    console.log("Generated Access Token:", token);
    return token;
}

userSchema.methods.getRefreshToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
    console.log("Generated Refresh Token:", token);
    return token;
}



export const User = mongoose.model("User", userSchema) 