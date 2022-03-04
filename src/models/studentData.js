const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    rollNumber:{
        type: String,
        required: true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})


const studentData = mongoose.model('studentData', studentSchema)
module.exports = studentData