import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
import dotenv from 'dotenv'
import { isValidObjectId } from "mongoose";

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

    const {accessToken,refreshToken} = await getAccessAndRefreshToken(user._id)
    console.log(accessToken,refreshToken);
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

const logOutUser = asyncHandler(async(req,res)=>{
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $unset : {
            refreshToken : 1
        }
    },
    {
        new : true
    })

    const options = {
        httpOnly : true,
        secure : false
    }

    return res
    .status(202)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(
        200,
        {},
        "User loggedout successfully"
    ))

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    //console.log(req.cookies);
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    console.log(incomingRefreshToken);

    if(!incomingRefreshToken){
        throw new ApiError(404, "Unauthorized request")
    }

    // if(!decodedToken){
    //     throw new ApiError(404,"Token decoding failed")
    // }
    console.log("enviroment variable :",process.env.REFRESH_TOKEN_SECRET);
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        console.log("decoded token",decodedToken);
        const user = await User.findById(decodedToken?._id)
        // console.log(user);
        if(!user){
            throw new ApiError(401,"User not available")
        }
        // console.log(user);
        console.log((incomingRefreshToken !==user?.refreshToken));
        if(incomingRefreshToken !==user?.refreshToken){
            throw new ApiError(401, "Invalid refresh Token");
        };

        const options = {
            httpOnly : true,
            secure : false
        }
        
        const {accessToken,newRefreshToken} = await getAccessAndRefreshToken(user._id)

        return res
        .status(200)
        .cookie("accessToken", accessToken,options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(
            200,
            {accessToken, refreshToken:newRefreshToken},
            "AccessToken Refeshed successfully"
        ))

    } catch (error) {
        throw new ApiError(500, error?.message)
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body;
    const userId = req.user?._id

    if(!oldPassword || !newPassword){
        throw new ApiError(400, "Both Old and New Password is required")
    }

    if(!isValidObjectId(userId) || !userId){
        throw new ApiError(404,"Inavlid User Id")
    }

    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404,"User does not exist");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(409,"Incorrect password")
    }

    user.password = newPassword;
    user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "password changes successfully"
    ))

})



export {registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassword}