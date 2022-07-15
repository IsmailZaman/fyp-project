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
    semesterList:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'studentSemester'
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
    }
})


const studentData = mongoose.model('studentData', studentSchema)
module.exports = studentData
