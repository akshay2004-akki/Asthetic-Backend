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
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
});

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

const updateUserDetails = asyncHandler(async(req,res)=>{
    const userId = req.user?._id
    const {fullname, email} = req.body;

    if(!isValidObjectId(userId)){
        throw new ApiError(404,"Invalid User id")
    }
    if(!fullname || !email){
        throw new ApiError(404,"Both Fullname and Email are required")
    }

    const user = await User.findByIdAndUpdate(userId,{
        $set : {
            fullname,
            email
        }
    }, {new : true}).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "User details updated successfully"
    ))
})

const getUserDetails = asyncHandler(async(req,res)=>{
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

const getPermissionByRole = asyncHandler(async(req,res)=>{
    const userId = req.user?._id;
    
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid User Id")
    }

    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(405,"User not found")
    }

    const permissions = user.permissions

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        permissions,
        "permissions fetched successfully"
    ))

})



export { loginUser, logOutUser, refreshAccessToken, changeCurrentPassword, updateUserDetails, getUserDetails, getPermissionByRole}