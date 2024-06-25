import mongoose, {Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config({
    path:"./.env" 
})

const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, "First Name is required"],
        minLength: [3, "First Name contaians at least 3 characters"],
    },
    lastName: {
        type: String,
        required: [true, "Last Name is required"],
        minLength: [3, "Last Name contaians at least 3 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        // validate: [validator.isEmail, "Email is invalid"]
    },
    phone: {
        type: String,
        required: [true, "Phone is required"],
        minLength: [10, "Phone Number must contains exactly 10 digits"],
        maxLength: [10, "Phone Number must contains exactly 10 digits"],

    },
    address: {
        city: {
            type: String,
            // required: true
        },
        country: {
            type: String,
            // required: true
        }
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "Password must contain at least 8 characters"],
        select: false,
    },
    dob: {
        type: Date,
        required: [true, "DOB Is Required!"],
    },
    gender: {
        type: String,
        required: [true, "Gender Is Required!"],
        enum: ["Male", "Female"],
    },
    avatar : {
        type : String,
        //required : true
    },
    role: {
        type: String,
        required: true,
        enum: ["Admin", "Patient", "Doctor"]
    },
},
{ timestamps: true });

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
            fullname: this.fullname,
            role : this.role,
            permissions : this.permissions
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