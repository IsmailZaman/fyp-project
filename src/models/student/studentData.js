const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    rollNumber:{
        type: String,
        required: true,
        lowercase: true
    },
    
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    //semester info(array)
    semesterList:[{
        Session:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Session'
        },
        courses:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'offeredCourse'
            }
        ],
        creditHours: { type: Number}
    }
    ],
    batch: {
        type: String,
        required: true,
        lowercase: true,
        ref: 'batch'
    },
    department: {
        type:String,
        required: true,
        lowercase: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    transcript: [
        {
            course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'courseData'
            },
            grade: {
                type: String,
                default: 'NA'
            },
            session: {
                type: String
            }
        }
    ]
})


const studentData = mongoose.model('studentData', studentSchema)
module.exports = studentData
