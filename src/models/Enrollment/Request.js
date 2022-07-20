const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({

    //batch name
    batch:{
        type: String,
        required:true,
        lowercase:true,
        ref: 'batch'
    },

    //student id
    student:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'studentData' //or studentData?
    },

    //courses requested by student for enrollment
    courses:[
        {
            course:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'offeredCourse',
                required: true
            },
            status:{
                type: String,
                default: 'Pending'
            }
        }
    ],
    closed:{
        type: mongoose.Schema.Types.Boolean,
        default: false
    },
    session:{
        type: String,
        ref: 'session',
        required: true,
        lowercase: true
    },
    creditHours:{
        type: Number,
        default: 0
    },
    message: {
        type: String
    }   
   

})

const Request = mongoose.model('request',requestSchema)
module.exports= Request
