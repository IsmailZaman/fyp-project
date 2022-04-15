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



module.exports = router