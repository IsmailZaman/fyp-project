const router = require('express').Router()
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole
const offeredCourse = require('../../models/Enrollment/offeredCourse')
const courseData =require('../../models/administration/courseData')
const Session = require('../../models/Enrollment/session')
const User = require('../../models/user')
const studentSemester = require('../../models/student/studentSemester')
const studentData = require('../../models/student/studentData')





//Creates a new offeredCourse. The offered course must have a valid session and should already exsist in the courseData table

router.post('/',auth,authrole('admin'), async(req,res)=>{
    
    
    const newCourse = new offeredCourse()

    newCourse["createdBy"] = req.user._id
    newCourse["name"] = req.body.name
    newCourse["Session"] = req.body.session
    
    //Validating the course name
    try{

        const courseVerify = await courseData.findOne({"name": newCourse.name})
       
        if(!courseVerify){
            throw new Error("Course not found")
        }
     
        
        const sessionVerify = await Session.findOne({"name": newCourse.Session})

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



//Deleting an offeredCourse. Should also be removed from the sessions list of courses.

router.delete('/',auth, authrole('admin'), async(req,res)=>{
    try{
        console.log("hello")
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
    console.log("hello")

    let newCourse=""
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
                console.log("Found course")

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











module.exports = router
