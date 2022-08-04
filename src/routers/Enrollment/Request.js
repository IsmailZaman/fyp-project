const router = require('express').Router()
const User = require('../../models/user')
const Request = require('../../models/Enrollment/Request')
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole
const Session = require('../../models/Enrollment/session')
const advisorData = require('../../models/advisor/advisor')
const offeredCourse = require('../../models/Enrollment/offeredCourse')
const studentData = require('../../models/student/studentData')


//get the number of pending and closed requests for the advisor
router.get('/number', auth, authrole(['advisor']), async(req,res)=>{
    
    try{    

        const advisorInfo = await advisorData.findById(req.user.advisorData).populate([{
            path: 'sessionList',
            populate: [
                {path: 'batch'}
            ]
        }])
        if(!advisorInfo) throw new Error('advisor info not found.')
        

        const activeSession = await Session.findOne({"status": true})
        if(!activeSession) throw new Error('active session not foundddd')

        //console.log('advisor', advisorInfo.sessionList[0])


       

        const batchesAdvising = advisorInfo?.sessionList?.filter((session)=>session.Session.toString() === activeSession._id.toString())

        const searchArray = batchesAdvising[0]?.batch?.map((batchData)=>batchData.name)

       
        const returnObject = {
            pending: 0,
            closed: 0
        }

        const batchRequests = await Request.find({batch: {$in: searchArray}, session: activeSession?.name})
        console.log(batchRequests)

        if(!batchRequests) throw new Error('Batch requests not found')

        batchRequests.forEach((request)=>{
            if(!request.closed) returnObject['pending'] = returnObject['pending'] + 1
            else returnObject['closed'] = returnObject['closed'] + 1
        })



        if(!batchRequests){
            throw new Error('No batch requests found.')
        }
        
        res.send(returnObject)

    }catch(e){
        console.log(e)
        res.status(404).send(e.message)
    }

})



//Get pending enrollment requests 
router.get('/unresolved', auth, authrole('admin'), async(req,res)=>{
    try{
        const activeSession = await Session.findOne({status: true})
        if(!activeSession) throw new Error('Session not found.')

        const pendingRequests = await Request.find({session: activeSession.name, closed: false})
        if(!pendingRequests) throw new Error('No requests found.')
        console.log(pendingRequests.length)

        res.status(200).send(String(pendingRequests.length))

    }catch(e){
        res.status(404).send(e.message)
    }
})


router.get('/piechart', auth, authrole('admin'), async(req,res)=>{
    try{
        const activeSession = await Session.findOne({status: true})
        if(!activeSession) throw new Error('Session not found.')

        const totalRequests = await Request.find({session: activeSession.name})
        const pendingRequests = totalRequests.filter(request => {
            return request.closed === false
        })
        if(!totalRequests) throw new Error('No requests found.')
        console.log(pendingRequests.length)

        res.status(200).send({
            pending: pendingRequests?.length,
            closed: totalRequests?.length - pendingRequests?.length
        })

    }catch(e){
        res.status(404).send(e.message)
    }

})


//get all the pending requests for a batch
router.get('/pending/:session', auth, authrole(['admin','advisor']), async(req,res)=>{
    try{    
        const sessionRequests = await Request.find({session: req.params.session})
        if(!sessionRequests){
            throw new Error('No requests found.')
        }
        const pending = sessionRequests.filter((request)=>{
            return request.closed === false
        })
        res.send(pending)

    }catch{
        res.status(404).send()
    }

})



router.patch('/drop', auth, async(req,res)=>{
    
    try{
        const {req_id, course_id} = req.query
        if(!req_id || !course_id) throw new Error('incorrect parameters')
        

        const request = await Request.findById(req_id).populate({
            path: 'courses',
            populate: ['course']
        })
        
        
        if(!request) throw new Error('request not found')

        if(request.student.toString() !== req.user.studentData.toString()) throw new Error('Forbidden')

        //Incase a student has already been enrolled into the course. Then we dont just remove him from request, but also from enrolledCourse & studentData.
        let enrolledCourse = ''

        request.courses = request.courses.filter((course)=> {
            if(course._id.toString() === course_id.toString()) {
                request.creditHours = Number(request.creditHours) - Number(course.course.creditHours)
                if(course.status === 'Enrolled') enrolledCourse = course.course._id
            }
            
            return course._id.toString() != course_id.toString()}
        )

        //If the student has already been enrolled.
        if(enrolledCourse != ''){
            console.log('hello id', enrolledCourse)
            //First we need to find the offered course itself so we can update it. 
            const courseToDrop = await offeredCourse.findById(enrolledCourse)
            if(!courseToDrop) throw new Error('course not found')
            
            courseToDrop.enrolledStudents = courseToDrop.enrolledStudents.filter((student)=>{
                if(req.user.studentData?.toString() !== student.toString()) return true
            })

            //offeredCourse has been updated.
            await courseToDrop.save()

            //Next step is removing it from students own data.
            const session = await Session.findById(courseToDrop?.Session)
            if(!session) throw new Error('Unable to find active session')

            //code for checking the enrollment deadline.
            let today = new Date()
            today.setHours(today.getHours() + 5)
            session.enrollmentPeriod = new Date(session?.enrollmentPeriod)
            if(session.enrollmentPeriod.getTime() < today.getTime()){
                throw new Error('Cannot drop course, enrollment deadline has passed')
            }

            const student = await studentData.findById(req?.user?.studentData)
            if(!student) throw new Error('Unable to update student data')

            

            student.semesterList.forEach((semester)=>{
                if(semester.Session.toString() === session._id.toString()) {
                    semester.courses = semester.courses.filter(course=> course._id.toString() !== courseToDrop._id.toString())
                }
            })

            
            await student.save()

            
            
        }

        if(request.courses.length === 0) await Request.findByIdAndDelete(req_id)
        else await request.save()

        res.send('course dropped successfully.')

    }catch(e){
        if(e.message === 'Forbidden') res.status(403).send(e.message)
        else if(e.message === 'request not found') res.status(404).send(e.message)
        else if(e.message === 'incorrect parameters') res.status(400).send(e.message)
        else res.status(400).send()
    }

})






//enrollment request by a student
router.post('/create', auth,async(req,res)=>{
    const request =new Request()
    try{
        const session = await Session.findOne({status: true})
        if(!session){
            throw new Error("Session not found")
        }

        //converting date into UTC + 5 which so it matches local pakistan time

        let today = new Date()
        today.setHours(today.getHours() + 5)

        session.enrollmentPeriod = new Date(session?.enrollmentPeriod)

        if(session.enrollmentPeriod.getTime() < today.getTime()){
            throw new Error('Enrollment deadline has passed')
        }
        const student = await User.findById(req.user._id).populate('studentData')
        if(!student){
            throw new Error('student not found')
        }
        


        const existingRequest = await Request.findOne({session: session.name,student:req.user.studentData})
        if(!existingRequest){
            
            request['student'] = req.user.studentData
            request['session'] = session.name
            request['courses'] = req?.body?.courses
            request['batch'] = student?.studentData?.batch
            request['creditHours'] = req?.body?.creditHours
        }
        if(existingRequest){
            if(existingRequest.closed) existingRequest.closed = false
            const coursesToAdd = []
            let add = true
            req?.body?.courses.forEach((course)=>{
                add = true
                for(let i =0; i< existingRequest?.courses?.length; i++){
                    if(existingRequest?.courses[i]?.course.toString() === course.course){
                        add = false
                    }
                }
                if(add){
                    coursesToAdd.push(course)
                }
            })           
            existingRequest.courses = [...existingRequest.courses,...coursesToAdd]
            existingRequest.creditHours = existingRequest.creditHours + req?.body?.creditHours                                                                                                                                                                                                                                                                                                            
        }                                                                                                               
        
        if(!existingRequest){
            await request.save()
            return res.send(request)
        }
        if(existingRequest){
            await existingRequest.save()
            return res.send(existingRequest)
        }


    }catch(e){
        console.log(e.message)
        res.status(400).send(e.message)
    }

})




//approve request enrollments
router.patch('/approve/:id', auth,authrole('advisor'), async(req,res)=>{
    let modified = true
    let idx = 0
    try{
        const request = await Request.findById(req.params.id)
        if(!request){
            throw new Error('request not found')
        }

    }catch(e){
        res.status(400).send()
    }
})

//get request by id
router.get('/:id', auth, authrole(['admin','advisor']), async(req,res)=>{
    try{
        const request = await Request.findById(req.params.id).populate({
            path: 'courses',
            populate: {
                path: 'course',
                populate: {
                    path: 'data',
                    populate: {
                        path: 'department'
                    }
                }
            }
        })
        if(!request) throw new Error('No requests found')
        res.send(request)
    }catch(e){
        res.status(404).send(e.message)
    }
})


router.get('/',auth,async(req,res)=>{
    const id = req.user.studentData

    try{
        const activeSession = await Session.findOne({status: true})
        if(!activeSession){
            throw new Error('Session not found')
        }


        const request = await Request.findOne({student: id, session: activeSession.name}).populate({
            path:'courses',
            populate:{
                path:'course'
            }
        })
        if(!request){
            throw new Error('No request not found!')
        }
        console.log(request.student)
        console.log(id)
        if(request.student?.toString() != id?.toString()) throw new Error('No requests found.')
        res.send(request)

    }catch(e){
        res.status(404).send()
    }




})

//remove courses from a request






module.exports = router


