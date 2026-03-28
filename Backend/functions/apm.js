const mongoose = require("mongoose");
const Question = require("../modles/Questions")

async function apm(){
    cqp = []
    let qp = []
    let a = await Question.find({subject :"Applied Mechanics", chapter: "Unit III", category: 1,})
    let b = await Question.find({subject :"Applied Mechanics", chapter: "Unit III", category: 2,})
    let c = await Question.find({subject :"Applied Mechanics", chapter: "Unit III", category: 3,})
    let d = await Question.find({subject :"Applied Mechanics", chapter: "Unit IV", category: 1,})
    let e = await Question.find({subject :"Applied Mechanics", chapter: "Unit IV", category: 2,})
    let f = await Question.find({subject :"Applied Mechanics", chapter: "Unit IV", category: 3,})
    let kc = "a";

    let sets = [a, b, c, d, e, f];

for (let i = 0; i < sets.length; i++) {
    let l = sets[i].length;
    let j = Math.floor(Math.random() * l);
    qp.push(sets[i][j]); // push the actual object from a/b/c/d/e/f
}
    return(qp);
}
module.exports =apm; 


    