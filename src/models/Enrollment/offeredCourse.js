const res = require('express/lib/response')
const mongoose = require('mongoose')
const courseData = require('../courseData')
const Session = require('./session')



const offeredCourseSchema = new mongoose.Schema({
    name:{
        type: String,
        unique: true,
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
            ref: 'User'
        }
    ],
    session:{
        type: String,
        ref: 'session',
        required: true
    }
},{timestamps:true})





offeredCourseSchema.pre('save',async function(next){
    const {name, session} = this

    //Verifying the course and session from their respective tables
    try{
        const courseVerify = await courseData.findOne({"name":name})
        const sessionVerify = await Session.findOne({"name": session})


        if(!courseVerify || !sessionVerify){
            throw new Error("Either course or session does not exist")
        }
        sessionVerify.coursesOffered.push(this._id)
        await sessionVerify.save()

    }catch(e){
        console.log(e)
    }

    next()
})




const offeredCourse = mongoose.model('offeredCourse', offeredCourseSchema)

module.exports = offeredCourse