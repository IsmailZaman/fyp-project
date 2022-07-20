const mongoose = require("mongoose");




const semesterSchema = new mongoose.Schema({
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
})


const studentSemester = mongoose.model('studentSemester', semesterSchema)
module.exports = studentSemester
