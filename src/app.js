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

const app = express()
//app.use("*",cors())
app.use(cors({
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    origin: ['http://localhost:3000', 'http://localhost:5000']
}));
app.use(express.json())
app.use(cookieParser())



app.use(userRouter)
app.use('/refresh', refreshRouter)
app.use('/departments',departmentRouter)
app.use('/programs',programRouter)
app.use('/courses',courseDataRouter)

//Enrollment routers
app.use('/session',sessionRouter)
app.use('/offeredCourse', offeredCourseRouter)


module.exports=app