const mongoose = require('mongoose')
const Department = require('./department')


const programSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    }
},{timestamps: true})



const Program = mongoose.model('Program', programSchema)

module.exports = Program