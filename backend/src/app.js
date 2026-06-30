import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ApiError } from "./utils/ApiError.js";
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import 
import userRouter from './routes/user.routes.js'
import studentRouter from './routes/student.routes.js'
import teacherRouter from './routes/teacher.routes.js'
import classRouter from './routes/class.routes.js'
import feeRouter from './routes/fee.routes.js'
import attendanceRouter from './routes/attendance.routes.js'
import contactRouter from './routes/contact.routes.js'
import admissionRouter from './routes/admission.routes.js'
import assignmentRouter from './routes/assignment.routes.js'
import noticeRouter from './routes/notice.routes.js'
import marksRouter from './routes/marks.routes.js'
import timetableRouter from './routes/timetable.routes.js'
import studyMaterialRouter from './routes/studymaterial.routes.js'
import settingsRouter from './routes/settings.routes.js'
import holidayRouter from './routes/holiday.routes.js'
import teacherAttendanceRouter from './routes/teacherAttendance.routes.js'

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/teachers", teacherRouter);
app.use("/api/v1/classes", classRouter);
app.use("/api/v1/fees", feeRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/admissions", admissionRouter);
app.use("/api/v1/assignments", assignmentRouter);
app.use("/api/v1/notices", noticeRouter);
app.use("/api/v1/marks", marksRouter);
app.use("/api/v1/timetable", timetableRouter);
app.use("/api/v1/study-materials", studyMaterialRouter);
app.use("/api/v1/settings", settingsRouter);
app.use("/api/v1/holidays", holidayRouter);
app.use("/api/v1/teacher-attendance", teacherAttendanceRouter);

app.use((err, req, res, next) => {
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || []
    });
});


export { app }
