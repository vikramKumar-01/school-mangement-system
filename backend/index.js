import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./src/db/index.js";
import { app } from "./app.js";

connectDB()
.then(()=>{
    app.listen(process.env.PORT ||4600, ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("Mongodb connection failed!!",error);
})