const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({

    //batch name
    batch:{
        type: String,
        required:true,
        lowercase:true,
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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'offeredCourse'
        }
    ]
   

})

const requests = mongoose.model('requests',requestSchema)
module.exports= requests