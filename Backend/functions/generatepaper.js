const mongoose = require("mongoose");
const Question = require("../modles/Questions")

async function generateqp(){
    cqp = [];
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

module.exports = generateqp;

