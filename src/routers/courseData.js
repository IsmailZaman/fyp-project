const router = require('express').Router()
const auth = require('../middleware/auth').auth
const authrole = require('../middleware/auth').authrole
const courseData = require('../models/courseData')
const Department = require('../models//department')



//Only admin can add new courses
router.post('/',auth,authrole('admin'),async(req,res)=>{
    newCourse = new courseData()
    newCourse["name"] = req.body.name
    newCourse["createdBy"] = req.user._id

    try{
        const department = await Department.findOne({
            "name":req.body.department
        })
        if(!department){
            throw new Error("Department not found")
        }
        console.log(department)
        console.log(department._id)
        newCourse["department"] = department._id
        console.log(newCourse)

        await newCourse.save({user_id: req.user._id})
        res.send(200)

    }catch(e){
        res.status(404).send(e)


    }
})


router.get('/',auth,authrole('admin'),async(req,res)=>{

    try
    {
       const course =  await courseData.find({}).populate('department')
       if(!course){
        throw new Error("Course not found")
         }
         res.send(course)
    }
    catch(e)
    {
        console.log(e)
        res.status(404).send(e)
    }

})



module.exports = router