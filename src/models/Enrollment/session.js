const mongoose = require('mongoose')



const sessionSchema = new mongoose.Schema({

    name:{
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    academicYear:{
        type: Number,
        required: true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    enrollmentPeriod:{
        type: Date,
        required: true

    },
    status:{
        type: Boolean,
        required: true
    },
    coursesOffered:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'offeredCourse'
        }
    ]

}, {timestamps: true})


const Session = mongoose.model('Session', sessionSchema)

module.exports = Session


