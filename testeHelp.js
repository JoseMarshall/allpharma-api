require('dotenv').config({path:'functions/.env'})
const auth = require('./functions/midlewares/auth');
const express = require('express')
const bodyParser = require('body-parser')
const app= express()
app.listen(3000,()=>{
    console.log('Applicaton listening')
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.post('/auth',(req,res,next)=>{
    console.log(process.env.JWT_KEY)
    next()
}, auth.checkAuth);