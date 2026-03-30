const mongoose = require("mongoose");
const Question = require("../modles/Questions")

async function eqp(){
    cqp = []
    let qp = []
    let a = await Question.find({subject:'Engineering Mathematics-II', chapter: "Unit III", category: 1,})
    let b = await Question.find({chapter: "Unit III", category: 2,subject:'Engineering Mathematics-II'})
    let c = await Question.find({chapter: "Unit IV", category: 2,subject:'Engineering Mathematics-II'})
    let d = await Question.find({chapter: "Unit IV", category: 1,subject:'Engineering Mathematics-II'})
    {let la = a.length;
    let ja= Math.floor(Math.random() * la );
    qp.push(a[ja]);}

    {let lb = b.length;
    let jb= Math.floor(Math.random() * lb );
    qp.push(b[jb]);}

    {let ld = d.length;
    let jd= Math.floor(Math.random() * ld );
    qp.push(d[jd]);}

    {let lc = c.length;
    let jc= Math.floor(Math.random() * lc );
    qp.push(c[jc]);}

    return(qp) 
}
 module.exports = eqp;