import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
import dotenv from 'dotenv'
import { isValidObjectId } from "mongoose";
import {generateToken} from '../utils/generateToken.js'

dotenv.config({
    path:"./.env"
})

const getAccessAndRefreshToken = async (userId)=>{
    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const refreshToken = await user.getRefreshToken();
    const accessToken  = await user.getAccessToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false})

    return {accessToken, refreshToken}
}

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



