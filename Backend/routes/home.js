const express = require('express')
const router = express.Router();
const ejs= require("ejs")

router.get("/",(req,res)=>{
    res.render("home.ejs", { currTab: "home" });
})
module.exports= router;

