require('dotenv').config();
const express = require('express')
const mongoose = require('./db/mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const userRouter = require('./routers/user')
const departmentRouter = require('./routers/administration/department')
const programRouter = require('./routers/administration/program')
const courseDataRouter = require('./routers/administration/courseData')
const sessionRouter = require('./routers/Enrollment/session')
const offeredCourseRouter = require('./routers/Enrollment/offeredCourse')
const refreshRouter = require('./routers/handleRefresh')
const studentRouter = require('./routers/administration/studentData')
const advisorRouter = require('./routers/advisor/advisor')
const requestRouter = require('./routers/Enrollment/Request')
const batchRouter = require('./routers/administration/batch')
const courseEnrollmentRouter = require('./routers/Enrollment/CourseEnrollment')
const notificationsRouter = require('./routers/Notification/notifications')

const app = express()
//app.use("*",cors())
app.use(cors({
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization','x-csrf-token'],
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    exposedHeaders: ['*', 'Authorization','Set-Cookie' ]  
}));
app.use(express.json())
app.use(cookieParser())



app.use(userRouter)
app.use('/refresh', refreshRouter)
app.use('/departments',departmentRouter)
app.use('/programs',programRouter)
app.use('/courses',courseDataRouter)
app.use('/batch',batchRouter)

//Enrollment routers
app.use('/session',sessionRouter)
app.use('/offeredcourse', offeredCourseRouter)
app.use('/students', studentRouter)
app.use('/advisor', advisorRouter)
app.use('/requests',requestRouter)
app.use('/semester',courseEnrollmentRouter)
app.use('/notification',notificationsRouter)


module.exports=app
