import express from"express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended:true , limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// Session is required by Passport (even when using JWT)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// routes import 
import userRouter from './routes/user.routes.js';
import googleAuthRouter  from "./routes/gooleAuth.routes.js";

// routes declaration
app.use("/api/v1/users",userRouter);
app.use("/api/v1/auth",  googleAuthRouter);   // Google OAuth lives here
 
// ─── Global Error Handler ─────────────────────────────────────────────────────
 
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message    = err.message    || "Internal Server Error";
 
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
    });
});


export {app}