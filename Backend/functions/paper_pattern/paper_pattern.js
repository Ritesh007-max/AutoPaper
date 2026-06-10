async function pp(sub) {

if(sub==="science1" || sub ==="science2"){
    question=['5m','3m','2m','gr','obj','MCQ']; 
    number = [2,8,5,3,5,5];
    name = ["Answer The Following","Answer The Following","Answer The Following","GIVE REASON", "OBJ","MCQ"];
}

if(sub==="math-1" || sub ==="math-1"){
    question=['5','4','3b','3a','2b','2a','1b','1a']; 
    number = [2,3,4,2,5,3,4,4];
    name = ["Answer The Following","Answer The Following","Answer The Following","ACTIVITY","Answer The Following","ACTIVITY", "OBJ","MCQ"];

}

return {question,number,name}
}

module.exports = pp;