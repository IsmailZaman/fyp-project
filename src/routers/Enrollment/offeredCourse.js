const router = require('express').Router()
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole
const offeredCourse = require('../../models/Enrollment/offeredCourse')



router.post('/',auth,authrole('admin'), async(req,res)=>{

    req.body["createdBy"] = req.user._id
    const newCourse = new offeredCourse(req.body)
    
    try{
        await newCourse.save()
        res.send(newCourse)
    }catch(e){
        res.send(e)
    }
})









module.exports = router
