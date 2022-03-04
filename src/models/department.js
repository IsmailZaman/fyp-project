const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    programs:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    }]

},{timestamps: true})


const Department = mongoose.model('Department', departmentSchema)

module.exports = Department