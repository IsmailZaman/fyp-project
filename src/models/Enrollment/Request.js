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
        ref: 'User' //or studentData?
    },

    //courses requested by student for enrollment
    courses:[
        {
            course:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'offeredCourse',
                required: true
            },
            pending:{
                type: mongoose.Schema.Types.Boolean,
                default: true
            },
            rejected:{
                type: mongoose.Schema.Types.Boolean,
                default: false
            },
            enrolled:{
                type: mongoose.Schema.Types.Boolean,
                default: false
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
        type: Number
    }   
   

})

const Request = mongoose.model('request',requestSchema)
module.exports= Request
