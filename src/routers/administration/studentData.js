const router = require('express').Router()
const User = require('../../models/user')
const studentData = require('../../models/student/studentData')
const { listIndexes } = require('../../models/student/studentData')
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
    console.log('hello')
    const _id = req.user.studentData
    console.log(_id)
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
        console.log(e.message)
        res.sendStatus(404)
    }
})

//Get all previous courses for a particular session
router.get('/sessions/enrolledcourses/:id', auth, async(req,res)=>{
    console.log('hello')
    _id=req.params.id
    console.log(_id)
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

        console.log(Data)
       const list = Data.semesterList.filter((obj)=>
       {
        if(obj.Session._id.toString()==_id.toString()){
            return true
        }
       })

        //console.log(list)
        list2= list[0].courses.map((row)=>{
            return{'_id':row._id,'name':row.name,'creditHours':row.creditHours}
        })
        //console.log(list2)
        res.send(list2)
    }
    catch(e)
    {
        console.log(e.message)
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