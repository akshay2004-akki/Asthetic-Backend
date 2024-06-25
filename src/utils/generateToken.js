import { ApiResponse } from "./ApiResponse.js";

export const generateToken = (user, message, statusCode, res) => {
    const token = user.getAccessToken();

    // Determine the cookie name based on the user's role
    let cookieName;
    if (user.role === "Admin") {
        cookieName = "adminToken";
    } else if (user.role === "Patient") {
        cookieName = "patientToken";
    } else if (user.role === "Doctor") {
        cookieName = "doctorToken";
    }

    // const cookieName = user.role === "Admin" ? "adminToken" : "patientToken";

    res
        .status(statusCode)
        .cookie(cookieName, token, {
            expiresIn: new Date(
                Date.now() + process.env.ACCESS_TOKEN_EXPIRY * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
            secure: false,
            sameSite: "None"
        })
        .json(new ApiResponse(statusCode, {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            },
        }, message));
};