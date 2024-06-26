import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";

export const addNewAdmin = asyncHandler(async(req,res)=>{
    const { firstName, lastName, email, phone, address, dob, gender, password } = req.body;

    if(!firstName || !lastName || !email || !phone || !address || !dob || !gender || !password){
        throw new ApiError(409,"PLEASE FILL THE FULL FORM")
    }
    const existedAdmin = await User.findOne({email})
    if(existedAdmin){
        throw new ApiError(400, `${existedAdmin.role} with this Email already Registered`)
    }

    const createdAdmin = await User.create({
        firstName,
        lastName,
        email,
        phone,
        address,
        dob,
        gender,
        password,
        role: "Admin",
    })
    generateToken(createdAdmin,"Admin Added Successfully!",200,res)
})

