import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";

const getAccessAndRefreshToken = async (userId)=>{
    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const refreshToken = user.getRefreshToken();
    const accessToken  = user.getAccessToken();

    user.refreshToken = refreshToken;
    user.save({validateBeforeSave:false})

    return {accessToken, refreshToken}
}

const registerUser = asyncHandler(async(req,res)=>{
    const {username, email, fullname, password, role} = req.body;
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existerUser = await User.findOne({
        $or : [{username}, {email}]
    })

    if(existerUser){
        throw new ApiError(404, "User Already exist with same email and username");
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


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async(req,res)=>{
    const {email, username, password} = req.body;

    if(!email || !username || !password){
        throw new ApiError("Fields are required");
    }

    const user = await User.findOne({
        $or : [{username}, {email}]
    });

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(409,"Password is not correct");
    }

    const {accessToken,refreshToken} = getAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httOnly : true,
        secure : false
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",accessToken,options)
    .json(new ApiResponse(
        200,
        {loggedInUser, accessToken, refreshToken},
        "User Loggedin successfully"
    ))

})

export {registerUser, loginUser}