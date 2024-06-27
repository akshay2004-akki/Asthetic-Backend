import express from "express";
import { getUserDetails, getDoctorDetails } from "../controllers/user.controller.js";
import { registerUser } from "../controllers/user.controller.js";
import { login, logoutAdmin, logoutDoctor, logoutPatient } from "../controllers/LoginLogout.controller.js"
import { addNewAdmin } from "../controllers/admin.controller.js";
import { addNewDoctor, getAllDoctors } from "../controllers/doctor.controller.js";
import { isAdminAuthenticated, isPatientAuthenticated, isDoctorAuthenticated } from "../middlewares/admin.middleware.js"
import  {upload} from "../middlewares/multer.middleware.js"


const router = express.Router();

router.route("/patient/register").post(upload.fields([
    {
        name : "avatar",
        maxCount : 1,
    }, 
]), registerUser)


router.post("/login", login);
router.post("/admin/addnew",isAdminAuthenticated, addNewAdmin);
router.post("/doctor/addnew", isAdminAuthenticated, upload.single("docAvatar"), addNewDoctor);
router.get("/alldoctors", getAllDoctors);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/doctor/me", isDoctorAuthenticated, getDoctorDetails);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.get("/doctor/logout", isDoctorAuthenticated, logoutDoctor);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);




export default router;