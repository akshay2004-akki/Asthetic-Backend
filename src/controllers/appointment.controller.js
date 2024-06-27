import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Appointment } from "../models/appointment.model.js";

export const bookAppointment = asyncHandler(async(req,res)=>{
    const {patientId} = req.user;
    const {doctorId} = req.doctor

    const { city, pincode, appointmentDate, department } = req.body;

    if (!city || !pincode || !appointmentDate || !department) {
        throw new ApiError(400, "Please provide all required fields");
    }
    const existingAppointment = Appointment.findOne({
        patient:patientId,
        doctor:doctorId
    })
    if (existingAppointment) {
        throw new ApiError(400, "Your appointment was already booked. Please wait for any update!");
    }

    const createdAppointment = await Appointment.create({
        patient: patientId,
        patientFirstName: patientId.firstName,
        patientLastName: patientId.lastName,
        doctor: doctorId,
        doctorFirstName: doctorId.firstName,
        doctorLastName: doctorId.lastName,
        experience: doctorId.experience,
        appointmentCharges: doctorId.appointmentCharges,
        city,
        pincode,
        appointmentDate,
        department,
    })
    return res.status(201).json(
        new ApiResponse(200, createdAppointment, "Your Appointment Booked!")
    )
})

export const updateAppointmentStatus = asyncHandler(async(req,res)=>{
    const {id} = req.params;

    if(!id){
        throw new ApiError(400,"Id needed")
    }

    let appointment = await Appointment.findById(id);
    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    appointment = await Appointment.findOneAndUpdate(id, req.body,{
        new : true,
        runValidators : true,
        useFindAndModify : false
    })

    return res.status(200).json(new ApiResponse(200,appointment,"Appointment Status Updated!"))

})

export const deleteAppointment = asyncHandler(async(req,res)=>{
    const {id} = req.params;

    if(!id){
        throw new ApiError(404,"Id not found");
    }

    try {
        await Appointment.findByIdAndDelete(id);
        return res.status(200).json(new ApiResponse(200,{},"Appointment deleted successfully"))
    } catch (error) {
        throw new ApiError(404,error?.message)
    }
    
})

export const getAllAppointments = asyncHandler(async(req,res)=>{
    const appointments = await Appointment.find();

    if(!appointments){
        throw new ApiError(500,"No Appointments found")
    }

    return res.status(200).json(new ApiResponse(200,appointments,"Appointments fetched"))

})