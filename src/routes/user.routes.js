import { Router } from "express";
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassword, updateUserDetails, getUserDetails } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(upload.fields([
    {
        name : "avatar",
        maxCount : 1,
    }, 
]), registerUser)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/update-details").patch(verifyJWT, updateUserDetails)
router.route("/get-details").get(verifyJWT, getUserDetails)

export default router;