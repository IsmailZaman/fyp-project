const router = require('express').Router()
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole
const offeredCourse = require('../../models/Enrollment/offeredCourse')
const courseData =require('../../models/administration/courseData')
const Session = require('../../models/Enrollment/session')
const User = require('../../models/user')
const studentData = require('../../models/student/studentData')
const Request = require('../../models/Enrollment/Request')






//Creates a new offeredCourse. The offered course must have a valid session and should already exsist in the courseData table

router.post('/',auth,authrole('admin'), async(req,res)=>{
    
    
    const newCourse = new offeredCourse()

    newCourse["createdBy"] = req.user._id
    newCourse["name"] = req.body.name
    newCourse["Session"] = req.body.session
    
    //Validating the course name
    try{
        console.log(newCourse)
        const courseVerify = await courseData.findOne({"name": newCourse.name})
       
        if(!courseVerify){
            throw new Error("Course not found")
        }
     
        
        const sessionVerify = await Session.findOne({"name": newCourse.Session, "status": true})
        if(!sessionVerify){
            throw new Error("No active session of this name found")
        }
        
        sessionVerify["coursesOffered"].push(newCourse._id)

        try{
            await sessionVerify.save()
        }catch(e){
            res.status(404).send("Failed to update courses offered list")
        }
        


        if(!sessionVerify){
            throw new Error("Session not found")
        }

        const course = await newCourse.save()
        if(!course){
            throw new Error("Couldn't save course")
        }

        res.send(course)



    }catch(e){
        console.log(e)
        res.status(404).send()
    }

})


//Takes a list of new offeredCourses. The offered courses must already exist in the courseData table

router.post('/add',auth,authrole('admin'), async(req,res)=>{
    const courses = req.body.courses
    console.log(courses)

    async function addNewCourses(courseList){
        let coursesAdded = 0
        let add = true
        const activeSession = await Session.findOne({status: true}).populate('coursesOffered')

        for(x in courseList){
            const existingCourse = await courseData.findById(courseList[x])
            add = true
            if(existingCourse){
                const newCourse = new offeredCourse()
                newCourse["createdBy"] = req.user._id
                newCourse["name"] = existingCourse.name
                newCourse["Session"] = activeSession._id
                newCourse["creditHours"] = existingCourse.creditHours
                newCourse["data"] = existingCourse._id

                for(course in activeSession.coursesOffered){
                    if(activeSession.coursesOffered[course].name === newCourse.name){
                        add = false
                    }
                }
                if(add){
                    await newCourse.save()
                    activeSession.coursesOffered.push(newCourse._id)
                    coursesAdded = coursesAdded + 1
                }
            }
        }
        await activeSession.save()
        return coursesAdded
    }

    
    try{
        const activeSession = await Session.findOne({active: true})
        if(!activeSession){
            throw new Error('Active Session not found.')
        }

        const result = await addNewCourses(courses)
        await activeSession.save()
        res.send(`${result} courses added.`)

        

    }catch(e){
        console.log(e.message)
        res.status(400).send(e.message)
    }

})

//Deleting an offeredCourse. Should also be removed from the sessions list of courses.

router.delete('/',auth, authrole('admin'), async(req,res)=>{
    try{
        
        const deleteCourse = await offeredCourse.findOne({"name": req.body.name, "Session": req.body.session})

        if(!deleteCourse){
            throw new Error("Course not found")
        }   
        console.log(deleteCourse)

        //Delete the references from the session list of courses.
        const courseSession = await Session.findOne({"name": deleteCourse.Session})

        console.log(deleteCourse._id)
        console.log(courseSession.coursesOffered)

        //FIND THE COURSE AND DELETE IT FROM COURSES OFFERED LIST
        let newCourseArr = courseSession.coursesOffered.filter((value)=>!deleteCourse._id.equals(value))

        courseSession.coursesOffered = newCourseArr


        await courseSession.save()

        await deleteCourse.delete()

        console.log("Deleted")
        res.send("DELETED")
    }catch(e){
        res.status(404).send(e)
    }
})


//Course Enrollment
//When a student sends request to this link, we check if we have an active session. If we have one, we will create
//a new semester for student and enroll him. 
router.post('/enroll', auth, async(req,res)=>{
   

    let newCourse=""
    let courseFound = false
    const studentUser = await User.findById(req.user._id) //contains the user credintials etc
    const student = await studentData.findById(studentUser.studentData).populate('semesterList').exec() // contains the student data


    try{
        //session check
        const activeSession = await Session.findOne({"status": true}).populate('coursesOffered')
        
        
        //Check if the active session is within deadline
        if(!activeSession){
            res.status(404).send("Course not found")
        }
        let today = new Date()
        
        let deadline = new Date(activeSession.enrollmentPeriod)
        if(today.getTime() > deadline.getTime()){
            console.log("Bro you're late")
        }

        //Course check: Check if the course is offered. If it is, then enroll the student

        for(course of activeSession.coursesOffered){
            if(course["name"] === req.body.name){
                courseFound = true

                if(course["enrolledStudents"].includes(student._id)){
                    throw new Error("Already enrolled");
                }
                else{
                    course["enrolledStudents"].push(student._id)
                    newCourse = await course.save()
                    console.log(course)
                    break
                }
                
            }
            
        }

        if(!courseFound){
            throw new Error("Course does not exist")
        }

        //Enroll the student in the course if all the checks are passed

        //Add enrollment info in student's data too
        
        if(!student){
            throw new Error("Unable to find student data")
        }

        console.log("reached here")
        
        // 1) Student already has a new semester object which is active currently and it matches our session.
        // 2) Student does not have a new semester object but we need to create one.
        // 3) Student does not have any semester object. 
        

        //1 check
        let foundSemester = false

        
        for(sem of student.semesterList){
            if(sem.Session === activeSession.name){
                console.log("Found semester")

                sem.courses.push(course._id)
                await sem.save()
                foundSemester = true
            }
        }

        if(!foundSemester){
            console.log("not found semester")

            const newSemester = new studentSemester({
                "studentData": student._id,
                "Session": activeSession.name,
                "active":true
            })
            newSemester.courses.push(course._id)
            await newSemester.save()
            student.semesterList.push(newSemester)
            await student.save()
        
        
        }

        res.send("Successfully enrolled")


    }catch(e){
        console.log(e)
        res.status(404).send()
    }

})


router.get('/', auth,async(req,res)=>{
    try{
        const courses = await offeredCourse.find({})
        if(!courses){
            throw new Error('Courses not found')
        }
        res.send(courses)
    }catch(e){
        res.status(404).send('Courses not found')
    }
})

router.get('/active', auth, async(req,res)=>{
    try{
        const activeSession = await Session.findOne({"status": true})
        if(!activeSession){
            throw new Error("Session not found")
        }
        
        const courses = await offeredCourse.find({Session: activeSession._id}).populate([{
            path: 'data',
            populate: {
                path: 'department'
            }},
            {
                path: 'Session'
            }
        ])
        
        if(!courses){
            throw new Error("Courses not found")
        }
        res.send(courses)
    }catch(e){
        console.log(e)
        res.status(404).send('Courses not found')
    }
})

//This request will only return the courses in which the student is not currently enrolled in or has not requested to be enrolled in
router.get('/enrollment', auth, authrole('student'),async(req,res)=>{
    try{

        const activeSession = await Session.findOne({"status": true})
        if(!activeSession){
            throw new Error("Session not found")
        }
        
        const courses = await offeredCourse.find({Session: activeSession._id}).populate([{
            path: 'data',
            populate: {
                path: 'department'
            }},
            {
                path: 'Session'
            }
        ])

        const existingRequest = await Request.findOne({student: req.user.studentData, session: activeSession.name}).populate({
            path:'courses',
            populate:{
                path:'course'
            }
        })
        if(!courses){
            throw new Error('Courses not found')
        }

        let filteredCourses = []
        let matchFound = false
        if(existingRequest){
            for(let i =0; i < courses.length; i++){
                matchFound = false
                for(let j =0; j<existingRequest.courses.length; j++){
                    if(courses[i]?.data?.name === existingRequest?.courses[j]?.course?.name){
                        matchFound = true
                    }
                }
                if(matchFound == false){
                    filteredCourses.push(courses[i])
                }
            }
        }
        
        if(!existingRequest)filteredCourses = courses
        
        res.send(filteredCourses)
        
    

    }catch(e){
        res.status(404).send('Courses not found')
    }








})

const compare = function(a,b){
    if(a?.studentsEnrolled < b?.studentEnrolled) return 1
    if(a?.studentsEnrolled > b?.studentsEnrolled) return -1
    return 0
}

router.get('/barchart/:id', auth, authrole('admin'), async(req,res)=>{
    try{
        console.log('hello')
        const activeSession = await Session.findOne({status: true}).populate({
            path: 'coursesOffered',
            populate: {
                path: 'data',
                populate: {
                    path: 'department'
                }
            }
        })
        if(!activeSession) throw new Error('active session not found.')

       
        let courses = activeSession?.coursesOffered.filter((course)=>course.data?.department?._id?.toString() === req.params.id)
        courses = courses.map((course)=>{
            return {
                courseName: course?.name,
                studentsEnrolled: course?.enrolledStudents?.length
            }
        })

        courses.sort(compare)

        
        
        res.send(courses)

    }catch(e){
        console.log(e.message)
        res.status(400).send(e.message)
    }







})

//Find students enrolled in a particular course
router.get('/enrolled/students/:id', auth, authrole('admin'),async(req,res)=>
{
    try{
        const stds = await offeredCourse.findById(req.params.id).populate('enrolledStudents')
        if(!stds){
            throw new Error("No students enrolled")
        }

        const dataToSend = stds.enrolledStudents.map((data)=>{
            return {'_id':data._id, 'rollNumber':data.rollNumber,'batch':data.batch,'department':data.department}
        
        }
            
            )

        res.send(dataToSend)


    }
    catch(e){
        res.status(404).send(e.message)

    }
})
  








module.exports = router
