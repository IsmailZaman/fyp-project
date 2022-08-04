const mongoose = require('mongoose')



const batchSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    department:{
        type: String,
        ref: 'Department'
    }
},{timestamps: true})





const Batch= mongoose.model('batch', batchSchema)

module.exports = Batch