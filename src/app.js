const express = require('express')
const mongoose = require('./db/mongoose')
const userRouter = require('./routers/user')
const departmentRouter = require('./routers/department')
const programRouter = require('./routers/program')
const courseDataRouter = require('./routers/courseData')

const sessionRouter = require('./routers/Enrollment/session')
const offeredCourseRouter = require('./routers/Enrollment/offeredCourse')

const app = express()
app.use(express.json())




app.use('/departments',departmentRouter)
app.use('/programs',programRouter)
app.use('/courses',courseDataRouter)

//Enrollment routers
app.use('/session',sessionRouter)
app.use('/offeredCourse', offeredCourseRouter)


module.exports=app