const router = require('express').Router()
const User = require('../../models/user')
const studentData = require('../../models/student/studentData')
const { listIndexes } = require('../../models/student/studentData')
const Session = require('../../models/Enrollment/session')
const courseData = require('../../models/administration/courseData')
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

//Get all sessions for a student
router.get('/allsessions', auth, async(req,res)=>{

    const _id = req.user.studentData
    try
    {
        const data = await studentData.findById(_id).populate({
            path:'semesterList',
            populate:
            {
                path: 'Session',
            }

    })
        res.send(data)
    }
    catch(e)
    {
        res.sendStatus(404)
    }
})

//Get all previous courses for a particular session
router.get('/sessions/enrolledcourses/:id', auth, async(req,res)=>{

    _id=req.params.id
    try
    {    
        const Data = await studentData.findById(req.user.studentData).populate([

            {path:'semesterList',populate:{
                path:'Session'
            }},
            {
                path:'semesterList',populate:{
                    path:'courses'}
            }
        ])

        
       const list = Data.semesterList.filter((obj)=>
       {
        if(obj.Session._id.toString()==_id.toString()){
            return true
        }
       })

        
        list2= list[0].courses.map((row)=>{
            return{'_id':row._id,'name':row.name,'creditHours':row.creditHours}
        })
        
        res.send(list2)
    }
    catch(e)
    {
       
        res.sendStatus(404)
    }
})

//gets prereq data for one course for a student
router.post('/prereqdata',auth, async(req,res)=>{
    try{

       let courses = await courseData.find({_id: req?.body})
       courses = courses.map((course)=>{
           return {id:course._id,
             name: course.name}
       })
       if(!courses) throw new Error('Courses not found')

        res.send(courses)

    }catch(e){
        res.status(404).send(e.message)
    }

})

//het transcript for student id.
router.get('/transcript/:id', auth, authrole(['advisor','admin']), async(req,res)=>{
    const _id = req.params.id
    try{
        const student = await studentData.findById(_id).populate({
            path: 'transcript',
            populate: {
                path: 'course'
            }
        })
        if(!student){
          throw new Error('transcript not found')
       }

       res.send(student.transcript)
    }
    catch(e)
    {
        res.status(404).send()
    }

})


//Return student data by id
router.get('/:id', auth,authrole('admin'),async(req,res)=>{
    const _id = req.params.id 
   
    
    try{
        const user = await User.findById(_id).populate('studentData')
        if(!user){
          return res.status(404).send()
       }

       res.send(user)
    }
    catch(e)
    {
        res.status(404).send()
    }
})

//Admin can access student's enrollment history (all session)
router.get('/enrollhistory/sessions/:id',auth,authrole('admin'),async(req,res)=>{
    const _id = req.params.id
    
    try{
        const stdData=await User.findById(_id).populate([
            {path:'studentData',populate:{
                path:'semesterList'
            }},
            {
                path:'studentData',populate:{
                    path:'semesterList',populate:{
                        path:'Session'

                    }
                }
            },
        ])
        //extracting required data
        const list = stdData.studentData.semesterList.map((row)=>{
            obj={ 'id':row.Session._id,'name':row.Session.name,'academicYear':row.Session.academicYear,'status':row.Session.status? 'Active':'Inactive'}
            return obj
        })
        res.send(list)
    }
    catch(e){
        
        res.sendStatus(404)
    }
})
//Admin can access student's enrollment history (all courses)
router.get('/enrollhistory/courses/:sessionid/:userid',auth,authrole("admin"),async(req,res)=>{

    const _id = req.params.sessionid
    const st= req.params.userid
    

    try{
        const stdData=await User.findById(st).populate([
            {path:'studentData',populate:{
                path:'semesterList'
            }},
            {
                path:'studentData',populate:{
                    path:'semesterList',populate:{
                        path:'Session'

                    }
                }
            },
            {
                path:'studentData',populate:{
                    path:'semesterList',populate:{
                        path:'courses'
                    }
                }
            },
        ])
        
        
        const list = stdData.studentData.semesterList.filter((obj)=>
        {
            
         if(obj.Session._id.toString() === _id.toString()){
             return true
         }
        })


        const list2= list[0].courses.map((row)=>{
            return{'_id':row._id,'name':row.name,'creditHours':row.creditHours}
        })
        
        res.send(list2)

    }
    catch(e)
    {
        res.send(404)
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
    }      
})


module.exports = router
