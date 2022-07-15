const mongoose = require('mongoose');

const advisorSchema = new mongoose.Schema({

    //List of Session in which he/she has advised
    sessionList:[{
        batch: [{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            lowercase: true,
            ref: 'batch'
        }],
        Session: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            lowercase: true,
            ref: 'Session'
        }
    }]
        
    

})

const advisorData = mongoose.model('advisorData',advisorSchema)
module.exports= advisorData
