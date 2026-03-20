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
let currentQP = []

async function generateqp(){
    let qp =[];
    let MCQ= await Question.find({questionType:'MCQ',difficulty:'easy'});
    let obj= await Question.find({questionType:'obj'});
    let gr= await Question.find({questionType:'gr'});
    let two= await Question.find({questionType:'2m'});
    let three= await Question.find({questionType:'3m'});
    let five= await Question.find({questionType:'5m'});
   
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
        }qp.push("GIVE REASON")
        for(let i=0;i<3;i++){
            let l = gr.length;
            let j= Math.floor(Math.random()* l );
            qp.push(gr[j]);
            gr.splice(j,1);
        }qp.push("Answer The Following")
        for(let i=0;i<5;i++){
            let l = two.length;
            let j= Math.floor(Math.random()* l );
            qp.push(two[j]);
            two.splice(j,1);
        }qp.push("Answer The Following")
        for(let i=0;i<8;i++){
            let l = three.length;
            let j= Math.floor(Math.random()* l );
            qp.push(three[j]);
            three.splice(j,1);
        }qp.push("Answer The Following")
        for(let i=0;i<2;i++){
            let l = five.length;
            let j= Math.floor(Math.random()* l );
            qp.push(five[j]);
            five.splice(j,1);
        }
        return(qp) 
}

app.listen(8080,()=>{
    console.log("LOCAL")
})
let cqp =[];

app.get("/",async (req,res)=>{
    cp =[];
    let qp = await generateqp()
    cqp = qp;
    res.render("index.ejs", { question: qp })
})
app.get("/download", async (req, res)=>{
    let qp = cqp;
    res.render("download.ejs", { question: qp });
})