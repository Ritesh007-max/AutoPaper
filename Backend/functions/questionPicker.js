const Question = require('../modles/questions');

async function pickQuestions(type, count, qp ,name, limit) {
    let sourceArray = await Question.find({ questionType: type});
    let n =0;

    while(n < count ){
        let l = sourceArray.length;
        let j = Math.floor(Math.random() * l);
        let qs = sourceArray[j];

        let k =sourceArray[j].marks
        let lim = limit[sourceArray[j].chapter-1];
        if(k <= lim){
            qp.push(qs);
            sourceArray.splice(j, 1);
            n+=1;
            limit[qs.chapter-1] -= qs.marks;
        }
    }
    qp.push(name);

}
module.exports= pickQuestions;