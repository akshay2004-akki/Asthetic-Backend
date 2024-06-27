import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Doctor } from "../models/doctor.model.js"
import { generateToken } from "../utils/generateToken.js";

export const login = asyncHandler(async(req,res)=>{
    const {email, password, role} = req.body
    
    if(!email || !password || !role) {
        throw new ApiError("Please Fill Full Form!", 400);
    }

    let user
    if(role==="Patient" || role==="Admin"){
        user = await User.findOne({email}).select("+password") 
    }else if(role==="Doctor"){
        user = await Doctor.findOne({email}).select("+password")
    }

    if(!user){
        throw new ApiError(400, `User with ${role} role not found`);
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiError("Invalid email or password", 400);
    }
    generateToken(user,"User LoggedIn Successfully",200,res)
})

export const logoutAdmin = asyncHandler(async (req, res) => {
    res
        .status(200)
        .cookie("adminToken", "", {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: false,
            sameSite: "None"
        })
        .json({
            success: true,
            message: "Admin logged out Successfully"
        });
})

export const logoutPatient = asyncHandler(async (req, res, next) => {
    res
        .status(200)
        .cookie("patientToken", "", {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: true,
            sameSite: "None"
        })
        .json({
            success: true,
            message: "User logged out Successfully"
        });
})


//! Logout Doctor
export const logoutDoctor = asyncHandler(async (req, res, next) => {
    res
        .status(200)
        .cookie("doctorToken", "", {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: true,
            sameSite: "None"
        })
        .json({
            success: true,
            message: "User logged out Successfully"
        });
})