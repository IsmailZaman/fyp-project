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
        res.status(404).send()
    }

})


//Takes a list of new offeredCourses. The offered courses must already exist in the courseData table

router.post('/add',auth,authrole('admin'), async(req,res)=>{
    const courses = req.body.courses

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
        

        //Delete the references from the session list of courses.
        const courseSession = await Session.findOne({"name": deleteCourse.Session})


        //FIND THE COURSE AND DELETE IT FROM COURSES OFFERED LIST
        let newCourseArr = courseSession.coursesOffered.filter((value)=>!deleteCourse._id.equals(value))

        courseSession.coursesOffered = newCourseArr


        await courseSession.save()

        await deleteCourse.delete()

        res.send("DELETED")
    }catch(e){
        res.status(404).send(e)
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
        res.status(404).send('Courses not found')
    }
})

// remove offered courses from add courses to session list
router.get('/addcoursepage', auth, authrole('admin'),async(req,res)=>{
    try
    {
        const session = await Session.findOne({"status":true}).populate("coursesOffered")
        if(!session){
            throw new Error("Session not found")
        }


        const courses= await courseData.find({}).populate("department")
        if(!courses){
            throw new Error('Courses not found')
        }

        const unoffered=[]
        let flag=false
        for(let i=0; i <courses.length; i++)
        {
            flag=true
            for(let j=0; j<session.coursesOffered.length;j++)
            {
                
                if(courses[i]._id.toString() === session.coursesOffered[j].data.toString()){
                    flag=false
                    
                    break
                }
            }
            if (flag)
            {
                
                unoffered.push(courses[i])
            }
        }
        
        const list = unoffered.map((row)=>
        {
            return{'_id':row._id,'name':row.name,'department':row.department.name,'creditHours':row.creditHours,}

        })
        
        
        res.send(list)
        
    }
    catch(e)
    {
        
        res.status(400).send(e.message)

    }
})

//This request will only return the courses in which the student is not currently enrolled in or has not requested to be enrolled in
router.get('/enrollment', auth, authrole('student'),async(req,res)=>{
    try{

        const data = await studentData.findById(req.user.studentData)
        if(!data) throw new Error('student data not found')

        const activeSession = await Session.findOne({"status": true})
        if(!activeSession){
            throw new Error("Session not found")
        }
        
        const courses = await offeredCourse.find({Session: activeSession._id}).populate([{
            path: 'data',
            populate: [
                {path: 'department'},
                // {path: 'prereqs'}

            ]},
            {
                path: 'Session'
            },
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
        

        filteredCourses = filteredCourses.map((course)=> {
            return {
                _id: course._id,
                name: course.name,
                department: course?.data?.department.name,
                creditHours: course.creditHours,
                prereqs: course?.data?.prereqs,
                dataId: course?.data?._id
            }
        })

        res.send({filteredCourses, transcript: data.transcript})
        
    

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
