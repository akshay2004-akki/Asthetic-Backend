import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import dotenv from 'dotenv'
import {generateToken} from '../utils/generateToken.js'
import { Appointment } from "../models/appointment.model.js";

dotenv.config({
    path:"./.env"
})

export const registerUser = asyncHandler(async (req, res, next) => {
    // taking the info from the user
    const { firstName, lastName, email, phone, address, dob, gender, password } = req.body;

    // checking the info provided by the user
    if (!firstName || !lastName || !email || !phone || !address || !dob || !gender || !password) {
        throw new ApiError(400, "Please Fill Full Form!");
    }

    // check if the user already exists
    let existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(400, `${existedUser.role} with this Email already Registered`);
    }

    const avatarLocalPath = req.files?.avatar[0].path
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    // finally create the user
    const createdUser = await User.create({
        firstName,
        lastName,
        email,
        phone,
        address,
        dob,
        gender,
        password,
        role: "Patient",
        avatar : avatar?.url
    });
    generateToken(createdUser, "User Registrated Successfully!", 200, res);
    // return res.status(201).json(
    //     new ApiResponse(200, createdUser, "User registered Successfully")
    // )
});

export const getUserDetails = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user?._id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(404,"User not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "User fetched successfully"
    ))
})

export const getDoctorDetails = asyncHandler(async (req,res)=>{
    const user = req.doctor;

    if(!user){
        throw new ApiError(500,"User does not exist")
    }

    return res.status(200).json(new ApiResponse(200, user, `${user.role} details`))
})

export const getUserAppointmentInfo = asyncHandler(async(req,res)=>{
    const {appointmentId} = req.params;
    try {

        const appointment = await Appointment.aggregate([
            {
                $match : {_id : new mongoose.Types.ObjectId(appointmentId)}
            },
            {
                $lookup : {
                    from : "User",
                    localField : "patient",
                    foreignField : "_id",
                    as : "patientDetails"
                }
            },
            {$unwind : "$patientDetails"},
            {
                $lookup : {
                    from : "Doctor",
                    localField : "doctor",
                    foreignField : "_id",
                    as : "doctorDetails"
                }
            },
            {$unwind : "$doctorDetails"},
            {
                $project: {
                    _id: 1,
                    appointmentDate: 1,
                    status: 1,
                    city: 1,
                    pincode: 1,
                    department: 1,
                    'patientDetails.firstName': 1,
                    'patientDetails.lastName': 1,
                    'patientDetails.email': 1,
                    'patientDetails.phone': 1,
                    'doctorDetails.firstName': 1,
                    'doctorDetails.lastName': 1,
                    'doctorDetails.email': 1,
                    'doctorDetails.phone': 1,
                    'doctorDetails.department': 1,
                    'doctorDetails.specializations': 1,
                    'doctorDetails.experience': 1
                }
            }
        ])

        if(appointment.length===0){
            throw new ApiError(500,"Appointment Not Found")
        }

        return res.status(200).json(new ApiResponse(200,appointment,"Appointmrnt fetched successfully"))
        
    } catch (error) {
        throw new ApiError(500,error?.message)
    }
})



