import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";
import { Doctor } from "../models/doctor.model.js";

export const isAdminAuthenticated = asyncHandler(async(req, res, next)=>{
    const token = req.cookies.adminToken
    if (!token) {
        throw new ApiError(401, "Unauthorized Access!");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded.id);
    if (req.user.role !== "Admin") {
        throw new ApiError(403, `${req.user.role} not authorized for this resource!`)
    }
    next();

})

export const isPatientAuthenticated = asyncHandler(async (req, res, next) => {
    // Get token from request cookies
    const token = req.cookies.patientToken;
    console.log("patient token : ", token);
    console.log("env token : ", process.env.ACCESS_TOKEN_SECRET);
    // Verify token
    if (!token) {
        throw new ApiError(401, "Unauthorized Access!");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decoded user",decoded);
    req.user = await User.findById(decoded.id);
    if (req.user.role !== "Patient") {
        throw new ApiError(403, `${req.user.role} not authorized for this resource!`)
    }
    next();
});

export const isDoctorAuthenticated = asyncHandler(async(req,res,next)=>{
    const token = req.cookies.doctorToken

    if(!token){
        throw new ApiError(400,"Unauthorized Access")
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await Doctor.findById(decoded.id)

    if (req.user.role !== "Doctor") {
        throw new ApiError(403, `${req.user.role} not authorized for this resource!`)
    }
    next();
})