let pickQuestions = require('./questionPicker');
let quota=require("../add_func/quota.js");
let sumarr=require("../add_func/sumarr.js");

async function call(question, number , name , sub,arr){
    let l=question.length;
    let qp =[];
    let limit = quota(sub);
     arr_a=arr;
    for(let i=0;i<l;i++ ){
        if(sumarr(limit)==0){
            limit = quota(sub);
        }
        await pickQuestions(question[i], number[i], qp, name[i], limit , sub, arr_a);
    }

return qp.reverse();
}

module.exports=call;