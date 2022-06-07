const courseData = require('../administration/courseData')
const mongoose = require('mongoose')



const offeredCourseSchema = new mongoose.Schema({
    name:{
        type: String,
        lowercase: true,
        required: true
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    creditHours: {
        type: Number,
        required: true
    },
    data:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'courseData'
    }   
},{timestamps:true})




offeredCourseSchema.pre('save', async function(next){
    const course = await courseData.findOne({name: this.name})
    if(!course){
        const error = new Error('Course data not found')
        next(error)
    }
    else{
        next()
    }

    
})





const offeredCourse = mongoose.model('offeredCourse', offeredCourseSchema)

module.exports = offeredCourse