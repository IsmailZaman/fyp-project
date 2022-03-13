const express = require('express')
const mongoose = require('./db/mongoose')
const userRouter = require('./routers/user')
const departmentRouter = require('./routers/administration/department')
const programRouter = require('./routers/administration/program')
const courseDataRouter = require('./routers/administration/courseData')

const sessionRouter = require('./routers/Enrollment/session')
const offeredCourseRouter = require('./routers/Enrollment/offeredCourse')

const app = express()
app.use(express.json())



app.use(userRouter)
app.use('/departments',departmentRouter)
app.use('/programs',programRouter)
app.use('/courses',courseDataRouter)

//Enrollment routers
app.use('/session',sessionRouter)
app.use('/offeredCourse', offeredCourseRouter)


module.exports=app