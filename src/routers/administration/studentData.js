const router = require('express').Router()
const User = require('../../models/user')
const studentData = require('../../models/student/studentData')
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole



//Returns the student data for all the students present

router.get('/',auth,authrole('admin') ,async(req,res)=>{
    try{

        const users = await User.find({roles: 'student'}).populate('studentData')
        
        if(!users){
            throw new error('users not found')
        }
        

        res.send(users)
    }catch(e){
        res.sendStatus(404)
    }
})

//Return student data by id
router.get('/:id', auth,authrole('admin'),async(req,res)=>{
    const _id = req.params.id 
    console.log( _id)
    
    try{
        const user = await User.findById(_id).populate('studentData')
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
//Update student or user data
router.patch('/update/:id',auth,authrole("admin"),async(req,res)=>{
    const _id = req.params.id 
    try{    
      const user = await studentData.findByIdAndUpdate(_id,{"$set":{rollNumber:req.body.rollNumber}},{new:true});  
    res.send(user)
    }
    catch(e)
    {
    res.status(404).send()
    console.log("Data can't be updated")
    }      
})

module.exports = router