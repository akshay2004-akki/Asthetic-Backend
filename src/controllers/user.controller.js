import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";

const registerUser = asyncHandler(async(req,res)=>{
    const {username, email, fullname, password, role} = req.body;
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existerUser = User.findOne({
        $or : [{username}, {email}]
    })

    if(existerUser){
        throw new ApiError(404, "User Already exist");
    }
    console.log("req.files : ", req.files);

    const avatarLocalPath = req.files?.avatar[0].path;
    if(!avatarLocalPath){
        throw new ApiError(404, "Avatar file required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(409,"Error while uploading on cloudinary")
    }

    const user = await User.create({
        username,
        email,
        fullname,
        avatar : avatar.url,
        password,
        role
    })

})