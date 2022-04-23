const router = require('express').Router()
const User = require('../../models/user')
const advisorData = require('../../models/advisor/advisor')
const studentData = require('../../models/student/studentData')
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole

//Get all advisors
router.get('/',auth,authrole('admin') ,async(req,res)=>{
    try{

        const users = await User.find({roles: 'advisor'}).populate("advisorData")
        
        if(!users){
            throw new error('users not found')
        }
        

        res.send(users)
    }catch(e){
        res.sendStatus(404)
    }
})

//get advisor by id
router.get('/id/:id', auth,authrole('admin'),async(req,res)=>{
    const _id = req.params.id 
    console.log( _id)
    
    try{
        const user = await User.findById(_id).populate('advisorData')
        if(!user){
          return res.status(404).send()
       }

       res.send(user)
    }
    catch(e)
    {
        console.log(req.params)
    }
   
})

module.exports = router

