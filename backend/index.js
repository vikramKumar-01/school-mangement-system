import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/index.js";
connectDB();