const express = require('express')
const router = express.Router();
const app = express();

router.get("/",(req,res)=>{
    res.render("about.ejs", { currTab: "about" });
})
module.exports= router;