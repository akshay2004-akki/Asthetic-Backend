import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const isAdminAuthenticated = asyncHandler(async(req, res, next)=>{
    const token = req.cookies.adminToken

    if (!token) {
        throw new ApiError(401, "Unauthorized Access!");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded._id);
    if (req.user.role !== "Admin") {
        throw new ApiError(403, `${req.user.role} not authorized for this resource!`)
    }
    next();

})

export const isPatientAuthenticated = asyncHandler(async (req, res, next) => {
    // Get token from request cookies
    const token = req.cookies.patientToken;

    // Verify token
    if (!token) {
        throw new ApiError(401, "Unauthorized Access!");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded._id);
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
    req.user = await User.findById(decoded._id)

    if (req.user.role !== "Doctor") {
        throw new ApiError(403, `${req.user.role} not authorized for this resource!`)
    }
    next();
})