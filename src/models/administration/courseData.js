const mongoose = require('mongoose')
const Department = require('./department')



const courseDataSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creditHours:{
        type: Number,
        required: true
    },
    department:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    prereqs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courseData',
        default: []
    }]
},{timestamps: true})





const courseData= mongoose.model('courseData', courseDataSchema)

module.exports = courseData
