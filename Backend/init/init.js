const mongoose = require('mongoose');
const fs = require('fs');
const Question = require('../modles/Questions');

const data = JSON.parse(fs.readFileSync('../unit4_apm.json', 'utf-8'));

main().then(()=>{
    console.log('Connected to MongoDB');
}).catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.disconnect();
    await mongoose.connect('mongodb://localhost:27017/autopap');
}

async function enterdata() {
  try {
    // await Question.deleteMany({});
    await Question.insertMany(data); 

    console.log(` ${data.length} questions inserted successfully!`);

  } catch (err) {
    console.error(err);
  } 
}
enterdata();