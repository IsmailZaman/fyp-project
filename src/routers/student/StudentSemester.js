const Request = require('../../models/Enrollment/Request')
const Session = require('../../models/Enrollment/session')
const studentData = require('../../models/student/studentData')
const studentSemester = require('../../models/student/StudentSemester')


const router = require('express').Router()
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole


router.get('/', auth,async(req,res)=>{
    
})



//enrol student into offered courses in the current session

router.post('/enroll', auth,authrole('advisor'),async(req,res)=>{
    try{
        const request = await Request.findById(req.body._id)
        if(!request) throw new Error('request not found')

        const activeSession = await Session.findOne({name: request.session})
        if(!activeSession) throw new Error('Session not found')

        const student = await studentData.findById(req.body.student)
        if(!student) throw new Error('student data not found')

        const currentSemester = student.semesterList.filter((semester)=>{
            semester.Session === activeSession._id
        })

        for(let i=0;i<request.courses.length; i+=1){
            if(req.body.courses[i].status === 'Approved'){
                request.courses[i] = 'Enrolled'
            }
        }

        if(currentSemester.length === 0) {
            newSemester = new studentSemester()
            newSemester['Session'] = activeSession._id

        
            newSemester['courses'] = request.courses.map((course)=>{
                console.log(course)
            })

        }
        console.log(newSemester)



        

        
        
        res.send(student)


    }catch(e){
        res.status(400).send(e.message)
    }
})









module.exports = router
