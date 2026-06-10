let science1 = [5,6,6,7,5,7,6,6,7,5];
let science2 = [5,6,6,7,5,7,6,6,7,5];
let math1 =[12,12,8,8,8,12]

function quota(sub){
    if(sub==="science1"){
    return science1;
}if(sub==="science2"){
    return science2;
}if(sub==="math-1")
    return math1
}

module.exports=quota;