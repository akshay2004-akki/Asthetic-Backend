import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getPermissionByRole } from "../controllers/user.controller.js";
import {manageUsers,
    manageRoles,
    viewStaffRecords,
    systemSettings,
    viewOwnRecords,
    createUpdateTreatmentNotes,
    accessPatientHistory,
    managePrescriptions,
    viewClinicRecords,
    manageStaffSchedules,
    overseeAppointments,
    accessReports,
    handleBilling,
    bookManageAppointments,
    sendReminders,
    accessBasicPatientInfo,
    handleCheckinsPayments,
    bookAppointments,
    updatePersonalInfo,
    viewPrescriptions} from '../controllers/permission.controller.js'

const router = Router()

router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file

router.route("/", getPermissionByRole);

router.post('/manage-users', manageUsers);
router.post('/manage-roles', manageRoles);
router.get('/view-all-records', viewStaffRecords);
router.post('/system-settings', systemSettings);
router.get('/view-own-records', viewOwnRecords);
router.post('/create-update-treatment-notes', createUpdateTreatmentNotes);
router.get('/access-patient-history', accessPatientHistory);
router.post('/manage-prescriptions', managePrescriptions);
router.get('/view-clinic-records', viewClinicRecords);
router.post('/manage-staff-schedules', manageStaffSchedules);
router.get('/oversee-appointments', overseeAppointments);
router.get('/access-reports', accessReports);
router.post('/handle-billing', handleBilling);
router.post('/book-manage-appointments', bookManageAppointments);
router.post('/send-reminders', sendReminders);
router.get('/access-basic-patient-info', accessBasicPatientInfo);
router.post('/handle-checkins-payments', handleCheckinsPayments);
router.post('/book-appointments', bookAppointments);
router.post('/update-personal-info', updatePersonalInfo);
router.get('/view-prescriptions', viewPrescriptions);

export default router