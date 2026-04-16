let quota = [5,6,6,7,5,7,6,6,7,5];

function pickQuestions(sourceArray, count, qp ,name) {
    
    let n =0;
    let limit = quota;

    while(n < count ){
        let l = sourceArray.length;
        let j = Math.floor(Math.random() * l);

        if(sourceArray[j].marks <= limit[sourceArray[j].chapter - 1]){
            qp.push(sourceArray[j]);
            sourceArray.splice(j, 1);
            n+=1;
            limit[sourceArray[j].chapter - 1] -= sourceArray[j].marks;
        }
    }qp.push(name);
}

module.exports= pickQuestions;