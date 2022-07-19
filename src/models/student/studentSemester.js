const mongoose = require("mongoose");




const semesterSchema = new mongoose.Schema({
    Session:{
        type: String,
        required: true,
        ref: 'Session'
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
