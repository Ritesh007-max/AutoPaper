const mongoose = require("mongoose");
const Question = require("../modles/Questions")

async function apm(){
    cqp = []
    let qp = []
    let a = await Question.find({subject :"Applied Mechanics", chapter: "Unit III", category: 1,})
    let b = await Question.find({subject :"Applied Mechanics", chapter: "Unit III", category: 2,})
    let d = await Question.find({subject :"Applied Mechanics", chapter: "Unit IV", category: 1,})
    let e = await Question.find({subject :"Applied Mechanics", chapter: "Unit IV", category: 2,})
    let kc = "a";
console.log("a:", a.length, "b:", b.length, "d:", d.length, "e:", e.length)
    let sets = [a, b, d, e];

for (let i = 0; i < sets.length; i++) {
    let l = sets[i].length;
    let j = Math.floor(Math.random() * l);
    qp.push(sets[i][j]); // push the actual object from a/b/c/d/e/f
}
    return(qp);
}
module.exports =apm; 


    