const mongoose = require('mongoose')
const NotificationType = require('../../NotificationType')
const Notifications = require('../Notification/Notification')
const studentData = require('../student/studentData')




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
    const course = this
    
    
    if(!course){
        const error = new Error('Course data not found')
            next(error)
    }
    else{
        const student = await studentData.findById(course.enrolledStudents[(course.enrolledStudents.length -1)])
        if(!student) next()
        
        const userNotification = await Notifications.findOne({userId: student.userId})
        if(!userNotification) next()
        

        const newNotification = new NotificationType()
        userNotification.notifications.push(newNotification.enrolledInCourse(this.name))
        
        await userNotification.save()
        next()
    }
    

    
})





const offeredCourse = mongoose.model('offeredCourse', offeredCourseSchema)

module.exports = offeredCourse
