require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4011;

app.get('/',(req,res)=>{
    res.send("hello World!");
})

app.get('/admin',(req,res)=>{
    res.send("this is admin panel");
})

app.get("/user",(req,res)=>{
    res.send("this is user panel");
})


app.listen(PORT, ()=>{
    console.log(`this app run from this ${PORT}`);
})