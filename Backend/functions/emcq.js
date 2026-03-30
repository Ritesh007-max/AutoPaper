const mongoose = require("mongoose");
const Question = require("../modles/Questions")

async function emcq(){
    cqp = [];
    let qp =[];
    let MCQ= await Question.find({questionType:'MCQ',subject:'Engineering Chemistry',chapter:'Unit III'});
    let MCQb= await Question.find({questionType:'MCQ',subject:'Engineering Chemistry',chapter:'Unit IV'});
    for(let i=0;i<10;i++){
            let l = MCQ.length;
            let j= Math.floor(Math.random() * l );
            qp.push(MCQ[j]);
            MCQ.splice(j,1);
        }
    for(let i=0;i<10;i++){
            let l = MCQb.length;
            let j= Math.floor(Math.random() * l );
            qp.push(MCQb[j]);
            MCQb.splice(j,1);
        }
        return(qp) 
}
module.exports = emcq;