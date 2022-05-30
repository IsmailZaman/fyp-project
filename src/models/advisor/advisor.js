const mongoose = require('mongoose');

const advisorSchema = new mongoose.Schema({

    //List of batches he/she has advised
    batches:[{
        batch: {
            type: String,
            required: true,
            lowercase: true
        },
        session: {
            type: String,
            required: true,
            lowercase: true
        }
    }]
        
    

})

const advisorData = mongoose.model('advisorData',advisorSchema)
module.exports= advisorData