const mongoose = require("mongoose");




const semesterSchema = new mongoose.Schema({
    studentData:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'studentData'
    },
    Session:{
        type: String,
        required: true,
        ref: 'Session'
    },
    active:{
        type: Boolean,
        required: true,
        default: true
    },
    courses:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'offeredCourse'
        }
    ]
})


const studentSemester = mongoose.model('studentSemester', semesterSchema)
module.exports = studentSemester