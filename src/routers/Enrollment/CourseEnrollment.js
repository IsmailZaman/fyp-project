const offeredCourse = require('../../models/Enrollment/offeredCourse')
const Request = require('../../models/Enrollment/Request')
const Session = require('../../models/Enrollment/session')
const studentData = require('../../models/student/studentData')




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
        console.log(student)
        if(!student) throw new Error('student data not found')

        const currentSemester = student.semesterList.filter((semester)=>{
            return semester.Session.toString() === activeSession._id.toString()
        })


        let coursesToEnroll = request.courses.filter((course)=>course.status === 'Approved')
        coursesToEnroll = coursesToEnroll.map((course)=> course.course)

        for(let i=0;i<request.courses.length; i+=1){
            if(req.body.courses[i].status === 'Approved'){
                request.courses[i].status = 'Enrolled'
            }
            if(req.body.courses[i].status === 'Rejected'){
                request.courses[i].status = 'Rejected'
            }
        }

        

        let duplicates = false
        const enrolledCourses = []

        //basically, if current semester doesnt exist, which means there is no corrosponding entry in student semesters for the current session,
        // we create a new semester, and then push it into our semester list
        if(currentSemester.length === 0) {
            duplicates = false
            console.log('didnt find semester')
            console.log(coursesToEnroll)
            newSemester = {
                Session: activeSession._id,
                courses: coursesToEnroll
            }

            student['semesterList'].push(newSemester)
        }
        else{
            let isNew = false
            for(let i=0; i<coursesToEnroll.length; i++){
                isNew = true
                for(let j =0; j<currentSemester[0].courses.length; j++){
                    if(coursesToEnroll[i].toString() === currentSemester[0].courses[j].toString()){
                        duplicates = true
                        isNew = false
                    }
                }
                if(isNew){
                    currentSemester[0].courses.push(coursesToEnroll[i])
                    enrolledCourses.push(coursesToEnroll[i])
                }
            }
        }

        if(duplicates){
            for(let i =0; i<enrolledCourses.length;i++){
                let course = await offeredCourse.findById(enrolledCourses[i])
                course.enrolledStudents.push(student._id)
                await course.save()
                
            }
        }else{
            for(let i=0; i<coursesToEnroll.length;i++){
                let course = await offeredCourse.findById(coursesToEnroll[i])
                course.enrolledStudents.push(student._id)
                await course.save()

            }
        }
        



        await student.save()
        await request.save()
        res.send(student)


    }catch(e){
        res.status(400).send(e.message)
    }
})









module.exports = router
