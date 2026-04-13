import { ApiError } from "../utils/ApiError.js"

export const AuthorizeRole = (...roles)=>{
    return (req, res, next) => {
        if(!req.User || !roles.includes(req.User.role)){
            throw new ApiError(
                403, `Role '${req.User?.role}' is not allowed to access this route`
            );
        }
        next();
    }
}