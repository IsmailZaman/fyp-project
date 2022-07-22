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
        if(!student) throw new Error('student data not found')

        const currentSemester = student.semesterList.filter((semester)=>{
            return semester.Session.toString() === activeSession._id.toString()
        })



        let coursesToEnroll = req.body.courses.filter((course)=>{
            return course.status === 'Approved'})

        console.log(coursesToEnroll)
        coursesToEnroll = coursesToEnroll.map((course)=> course.course)

        console.log(coursesToEnroll)

        

        const enrolledCourses = []

        //basically, if current semester doesnt exist, which means there is no corrosponding entry in student semesters for the current session,
        // we create a new semester, and then push it into our semester list
        if(currentSemester.length === 0) {
            
            console.log('didnt find semester')
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
                        isNew = false
                    }
                }
                if(isNew){
                    console.log('is new found')
                    enrolledCourses.push(coursesToEnroll[i])
                    currentSemester[0].courses.push(coursesToEnroll[i])
                }

            }
        }  
        
        if(enrolledCourses.length === 0) {
            for(let i =0; i<coursesToEnroll.length;i++){

                let course = await offeredCourse.findById(coursesToEnroll[i])
                if(!course) throw new Error('Invalid course id. Course not found')
                course.enrolledStudents.push(student._id)
                await course.save() 
            }



        }else{
            for(let i =0; i<enrolledCourses.length;i++){
                
                let course = await offeredCourse.findById(enrolledCourses[i])
                if(!course) throw new Error('Invalid course id. Course not found')
                course.enrolledStudents.push(student._id)
                await course.save() 
            }
        }

        
       
    


        //Update the request:
        for(let i=0;i<request.courses.length; i+=1){
            if(req.body.courses[i].status === 'Approved'){
                request.courses[i].status = 'Enrolled'
            }
            if(req.body.courses[i].status === 'Rejected'){
                request.courses[i].status = 'Rejected'
            }
        }
        
        let closeRequest = true;
        for(let i=0;i<request.courses.length;i++){
            if(request.courses[i].status !== 'Enrolled') closeRequest = false
        }

        if(closeRequest) request.closed = true


        
        
        
        await student.save()
        await request.save()
        res.send('Successfully handled the request.')


    }catch(e){
        console.log(e.message)
        res.status(400).send(e.message)
    }
})









module.exports = router
