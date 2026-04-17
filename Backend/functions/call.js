let pickQuestions = require('./questionPicker');
let quota=require("../quota/quota.js")

async function call(question, number , name ){
    let l=question.length;
    let qp =[];

    let limit = quota();

    for(let i=0;i<l;i++ ){
        await pickQuestions(question[i], number[i], qp, name[i], limit);
    }

return qp.reverse();
}

module.exports=call;