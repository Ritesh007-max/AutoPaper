const express = require('express')
const Question = require('./modles/Questions')
const app = express()
app.use(express.json())

app.listen(8080,()=>{
    cosole.log("LOCAL")
})

app.get("/",(req,res)=>{
    
})

