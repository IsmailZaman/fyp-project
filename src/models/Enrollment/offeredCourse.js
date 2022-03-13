const res = require('express/lib/response')
const mongoose = require('mongoose')
const courseData = require('../courseData')
const Session = require('./session')



const offeredCourseSchema = new mongoose.Schema({
    name:{
        type: String,
        unique: true,
        lowercase: true,
        ref: 'courseData'
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    enrolledStudents:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'studentData'
        }
    ],
    Session:{
        type: String,
        ref: 'session',
        lowercase: true
    }
},{timestamps:true})







const offeredCourse = mongoose.model('offeredCourse', offeredCourseSchema)

module.exports = offeredCourse