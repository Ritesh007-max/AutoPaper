const Question = require('../modles/questions');
let pickQuestions = require('./questionPicker');
const call =require("./call.js")

async function generateqp() {

    let question=['5m','3m','2m','gr','obj','MCQ'];
    let number = [2,8,5,4,5,5];
    let name = ["Answer The Following","Answer The Following","Answer The Following","GIVE REASON", "OBJ","MCQ"];

let qp = await call(question,number,name);

return qp;
}

module.exports = generateqp;