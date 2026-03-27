const express = require('express');
const Question = require('./modles/Questions');
const app = express();
const mongoose = require("mongoose");
const ejs= require("ejs");
const path = require("path");
const ejsMate = require("ejs-mate");


const generateqp = require("./functions/generatepaper.js");
const home = require("./routes/home.js");
const about = require("./routes/about.js");
const contact = require("./routes/contact.js");

app.engine("ejs", ejsMate); 
app.set("view engine","ejs")
app.set("views",path.join(__dirname,'./views/ejs'))
app.use(express.static(path.join(__dirname,'./public/')));
app.use(express.json())

main().then(()=>{
    console.log("connected")
}).catch((err)=>{
    console.log(err)
})

async function main(){
    mongoose.connect("mongodb://localhost:27017/autopaper")
}

app.use("/", home);
app.use("/about", about);
app.use("/contact", contact);

let cqp = [];
app.get("/paper",async (req,res)=>{
    let qp = await generateqp()
    cqp = qp;
    res.render("index.ejs", { question: qp })
})
app.get("/download", async (req, res)=>{
    let qp = cqp;
    res.render("download.ejs", { question: qp });
})
app.listen(8080,()=>{
    console.log("LOCAL")
})