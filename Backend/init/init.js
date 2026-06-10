const mongoose = require('mongoose');
const fs = require('fs');
const Question = require('../modles/Questions');

const data = JSON.parse(fs.readFileSync('../activity.json', 'utf-8'));


main().then(()=>{
    console.log('Connected to MongoDB');
}).catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.disconnect();
    await mongoose.connect('mongodb://localhost:27017/autopaper');
}

async function enterdata() {
  try {
    await Question.deleteMany({ subject: "Mathematics - I"});
    await Question.insertMany(data); 

    console.log(` ${data.length} questions inserted successfully!`);

  } catch (err) {
    console.error(err);
  } 
}

enterdata();