import asyncHandler from "../utils/asyncHandler.js";
import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

// Create a new doctor
const createDoctor = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { specialization, contactInfo } = req.body;

    // Validate input
    if (!userId || !specialization || !contactInfo) {
        throw new ApiError(400, "UserId, specialization, and contactInfo are required");
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Create the doctor
    const doctor = await Doctor.create({
        user: userId,
        specialization,
        contactInfo
    });

    return res.status(201).json(
        new ApiResponse(200, doctor, "Doctor created successfully")
    );
});

// Get all doctors
const getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find().populate('user', '-password -refreshToken');
    return res.status(200).json(
        new ApiResponse(200, doctors, "Doctors fetched successfully")
    );
});

// Get doctor by ID
const getDoctorById = asyncHandler(async (req, res) => {
    const doctorId = req.params.id;

    // Validate ID
    if (!mongoose.isValidObjectId(doctorId)) {
        throw new ApiError(400, "Invalid doctor ID");
    }

    const doctor = await Doctor.findById(doctorId).populate('user', '-password -refreshToken');

    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    return res.status(200).json(
        new ApiResponse(200, doctor, "Doctor fetched successfully")
    );
});

// Update doctor details
const updateDoctor = asyncHandler(async (req, res) => {
    const doctorId = req.params.id;
    const { specialization, contactInfo } = req.body;

    // Validate ID
    if (!mongoose.isValidObjectId(doctorId)) {
        throw new ApiError(400, "Invalid doctor ID");
    }

    // Find and update doctor
    let doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    doctor.specialization = specialization;
    doctor.contactInfo = contactInfo;
    await doctor.save();

    return res.status(200).json(
        new ApiResponse(200, doctor, "Doctor updated successfully")
    );
});

// Delete doctor
const deleteDoctor = asyncHandler(async (req, res) => {
    const doctorId = req.params.id;

    // Validate ID
    if (!mongoose.isValidObjectId(doctorId)) {
        throw new ApiError(400, "Invalid doctor ID");
    }

    // Find and delete doctor
    const doctor = await Doctor.findByIdAndDelete(doctorId);

    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Doctor deleted successfully")
    );
});

export { createDoctor, getAllDoctors, getDoctorById, updateDoctor, deleteDoctor };
