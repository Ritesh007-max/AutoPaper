const Question = require('../modles/questions');
let pickQuestions = require('./questionPicker');

async function generateqp() {
    let qp = [];

    let MCQ = await Question.find({ questionType: 'MCQ', difficulty: 'easy' });
    let obj = await Question.find({ questionType: 'obj' });
    let gr = await Question.find({ questionType: 'gr' });
    let two = await Question.find({ questionType: '2m' });
    let three = await Question.find({ questionType: '3m' });
    let five = await Question.find({ questionType: '5m' });
       
    pickQuestions(five, 2, qp, "Answer The Following");  
    pickQuestions(three, 8, qp,"Answer The Following");  
    pickQuestions(two, 5, qp,"Answer The Following");
    pickQuestions(gr, 3, qp,"GIVE REASON");  
    pickQuestions(obj, 5, qp,"OBJ"); 
    pickQuestions(MCQ, 5, qp,"MCQ");

    return qp.reverse();
}

module.exports = generateqp;