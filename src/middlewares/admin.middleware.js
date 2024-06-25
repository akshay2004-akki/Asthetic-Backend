import { ApiError } from "../utils/ApiError.js";

 export const verifyAdmin = (req,res,next)=>{
    const role = req.user.role;
    if(!req.user || !role.toLocaleLowerCase()==='admin'){
        throw new ApiError(500,"Access Denied, Only admins")
    }
    next()
}