const express = require('express');
const Question = require('./modles/Questions');
const app = express();
const mongoose = require("mongoose");
const ejs= require("ejs");
const path = require("path");
const ejsMate = require("ejs-mate");
const cookieParser = require('cookie-parser');

const generateqp = require("./functions/generatepaper.js");
const eqp = require("./functions/eqp.js");
const emcq = require("./functions/emcq.js");
const apm = require("./functions/apm.js");
const pps = require("./functions/pps.js");
const home = require("./routes/home.js");
const about = require("./routes/about.js");
const contact = require("./routes/contact.js");
const dotenv= require('dotenv');
dotenv.config();

app.engine("ejs", ejsMate); 
app.set("view engine","ejs")
app.set("views",path.join(__dirname,'./views/ejs'))
app.use(express.static(path.join(__dirname,'./public')));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

main().then(()=>{
    console.log("connected")
}).catch((err)=>{
    console.log(err)
})

async function main(){
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'autopaper' })
    console.log("DB Name:", mongoose.connection.db.databaseName);
    console.log("Host:", mongoose.connection.host);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
}

app.use("/", home);
app.use("/about", about);
app.use("/contact", contact);

let cqp = [];

app.get("/math", async(req,res)=>{
    let qp = await eqp();
    cqp=qp;
    res.render("index.ejs",{question: qp});
})

app.get("/chem",async (req,res)=>{
    let qp = await emcq()
    cqp=qp;
    res.render("index.ejs", {question :qp})
})

app.get("/apm",async (req,res)=>{
    let qp = await apm();
    cqp=qp;
    res.render("index.ejs", {question :qp})
})

app.get("/pps",async (req,res)=>{
    let qp = await pps();
    console.log(qp);
    cqp=qp;
    res.render("index.ejs", {question :qp})
})

app.get("/paper",async (req,res)=>{
    let qp = await generateqp()
    cqp = qp;
    res.render("index.ejs", { question: qp })
})

app.post('/modern', (req, res) => {       
    const sub = req.body.sub; 
    if(sub === "Chemistry"){res.redirect("/chem")}
    if(sub === "Applied Mechanics"){res.redirect("/apm")}
    if(sub === "Mathematics-2"){res.redirect("/math")}
    if(sub === "P.P.S"){res.redirect("/pps")}
})

app.get("/download", async (req, res)=>{
    let qp = cqp;
    res.render("download.ejs", { question: qp });
})

const PORT = process.env.PORT || 8080
app.listen(PORT, ()=>{
    console.log(`Running on port ${PORT}`)
})