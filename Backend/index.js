const express = require('express')
const Question = require('./modles/Questions')
const app = express()
app.use(express.json())
const mongoose = require("mongoose");
const ejs= require("ejs")
const path = require("path")
app.set("view engine",ejs)
app.set("views",path.join(__dirname,'../Frontend/views/'))

main().then(()=>{
    console.log("connected")
}).catch((err)=>{
    console.log(err)
})

async function main(){
    mongoose.connect("mongodb://localhost:27017/autopaper")
}

app.listen(8080,()=>{
    console.log("LOCAL")
})

app.get("/",async (req,res)=>{
    let MCQ= await Question.find({questionType:'MCQ',difficulty:'easy'});
    let obj= await Question.find({questionType:'obj'});
    let qp =[];
        qp.push("MCQ")
        for(let i=0;i<5;i++){
            let l = MCQ.length;
            let j= Math.floor(Math.random() * l );
            qp.push(MCQ[j]);
            MCQ.splice(j,1);
        }
        qp.push("OBJ")
        for(let i=0;i<5;i++){
            let l = obj.length;
            let j= Math.floor(Math.random()* l );
            qp.push(obj[j]);
            obj.splice(j,1);
        }
        res.render("index.ejs", { question : qp })
        
        
})


