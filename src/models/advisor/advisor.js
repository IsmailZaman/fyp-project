const mongoose = require('mongoose');

const advisorSchema = new mongoose.Schema({

    //batch name
    batch:{
        type: String,
        required:true,
        lowercase:true,
    },

    //list of students in the batch
    batchStudents:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'studentData'
        }
    ]

})

const advisorData = mongoose.model('advisorData',advisorSchema)
module.exports= advisorData