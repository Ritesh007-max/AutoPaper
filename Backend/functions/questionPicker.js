const Question = require('../modles/questions');

async function pickQuestions(type, count, qp ,name, quota,sub ,arr) {
    
    
    const sourceArray = arr.filter(q => q.questionType === type );

    let n =0;
    let limit = [...quota];
 
    while(n < count ){
        let l = sourceArray.length;
        let j = Math.floor(Math.random() * l);
        let qs = sourceArray[j];
        let k =sourceArray[j].marks 
        let lim = limit[sourceArray[j].chapter-1];

        if(k <= lim){
            await qp.push(qs);
            limit[qs.chapter-1] -= qs.marks;
            sourceArray.splice(j, 1);
            n+=1;
        }
        
        
       
    }
    await qp.push(name);
    }
module.exports= pickQuestions;