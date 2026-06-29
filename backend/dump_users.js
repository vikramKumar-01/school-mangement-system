import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const teacherSchema = new mongoose.Schema({
    name: String,
    subject: String,
    phone: String,
    email: String,
    salary: Number
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);

const fixDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "schoolDB" });
        
        // Add teacher profile for teacher@gmail.com
        await Teacher.findOneAndUpdate(
            { email: "teacher@gmail.com" },
            { name: "teacher", subject: "General", email: "teacher@gmail.com", salary: 50000, phone: "1234567890" },
            { upsert: true, returnDocument: 'after' }
        );

        // Add teacher profile for vikram kumar
        await Teacher.findOneAndUpdate(
            { email: "vikram123@gmail.com" },
            { name: "vikram kumar", subject: "Math", email: "vikram123@gmail.com", salary: 60000, phone: "0987654321" },
            { upsert: true, returnDocument: 'after' }
        );

        // Add teacher profile for vikram kumar (vikram124)
        await Teacher.findOneAndUpdate(
            { email: "vikram124@gmail.com" },
            { name: "vikram kumar", subject: "Science", email: "vikram124@gmail.com", salary: 60000, phone: "1112223334" },
            { upsert: true, returnDocument: 'after' }
        );

        // Add teacher profile for vikram kumar (vikram1245)
        await Teacher.findOneAndUpdate(
            { email: "vikram1245@gmail.com" },
            { name: "vikram kumar", subject: "English", email: "vikram1245@gmail.com", salary: 60000, phone: "5556667778" },
            { upsert: true, returnDocument: 'after' }
        );

        console.log("Teacher profiles created successfully.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixDb();
