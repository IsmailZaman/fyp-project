const router = require('express').Router()
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole
const courseData = require('../../models/administration/courseData')
const Department = require('../../models/administration/department')



//Only admin can add new courses
router.post('/',auth,authrole('admin'),async(req,res)=>{
    newCourse = new courseData()
    newCourse["name"] = req.body.name
    newCourse["createdBy"] = req.user._id
    newCourse["creditHours"] = req.body.creditHours
    
    try{
        const department = await Department.findOne({
            "name":req.body.dept
        })
        if(!department){
            throw new Error("Department not found")
        }
        
        newCourse["department"] = department._id
        

        await newCourse.save({user_id: req.user._id})
        res.status(201).send(`Created ${newCourse.name}`)

    }catch(e){
        res.status(400).send()
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
        res.status(404).send(e)
    }

})





module.exports = router
