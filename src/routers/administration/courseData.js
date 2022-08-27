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
       const course =  await courseData.find({}).populate([
           {path: 'department'},
           {path: 'prereqs'}
       ])
       if(!course){
        throw new Error("Course not found")
         }
         res.send(course)
    }
    catch(e)
    {
        res.status(404).send(e.message)
    }

})

//Previously written working code.

// router.post('/addprereq/:id', auth, authrole('admin'), async(req,res)=>{
//     try{   
//         let course = await courseData.findById(req.params.id)
//         if(!course) throw new Error('Course not found');
//         let count = 0
//         let shouldAdd = true
        
//         for(let i = 0; i<req.body.length; i++){
//             shouldAdd = true
//             for(let j = 0; j<course.prereqs.length; j++){
//                 if(req.body[i].toString() === course.prereqs[j].toString() || req.body[i].toString() === course._id){
//                     shouldAdd = false
//                 }
//             }
//             if(shouldAdd){
//                 course.prereqs.push(req.body[i])
//                 count +=1
//             }
//         }
//         await course.save()
//         res.send(`Added ${count} prerequisites for ${course.name}`)

//     }catch(e){
//         console.log(e.message)
//         res.status(400).send(e)
//     }
// })


router.post('/addprereq/:id', auth, authrole('admin'), async(req,res)=>{
    try{   
        let course = await courseData.findById(req.params.id)
        if(!course) throw new Error('Course not found');
        course.prereqs = req?.body


        await course.save()
        res.send(`Updated prerequisites for ${course.name}`)

    }catch(e){
        res.status(400).send(e)
    }
})





module.exports = router
