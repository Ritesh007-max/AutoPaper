const Question = require('../modles/questions');
let pickQuestions = require('./questionPicker');
const call =require("./call.js")
const pp=require('./paper_pattern/paper_pattern.js')

async function generateqp(sub) {



let {question,number,name}=await pp(sub);

let sourceArray= await Question.find({ subject: sub});

let qp = await call( question, number, name, sub, sourceArray );


return qp;
}

module.exports = generateqp;