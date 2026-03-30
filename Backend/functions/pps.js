const mongoose = require("mongoose");
const Question = require("../modles/Questions")

async function pps(){
    cqp = []
    let qp = []
    let a = await Question.find({subject:'PPS', chapter: "Unit III",})
    let b = await Question.find({chapter: "Unit IV", subject:'PPS'})

    {let la = a.length;
    let ja= Math.floor(Math.random() * la );
    qp.push(a[ja]);}

    {let lb = b.length;
    let jb= Math.floor(Math.random() * lb );
    qp.push(b[jb]);}


    return(qp) 
}
 module.exports = pps;