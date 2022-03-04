const Department = require('../models/department')
const Program =require('../models/program')
const router = require('express').Router()
const auth = require('../middleware/auth').auth
const authrole = require('../middleware/auth').authrole



//CREATES A NEW DEPARTMENT

router.post('/',auth,authrole('admin'),async(req,res)=>{
    const newDepartment = new Department(req.body)
    newDepartment["createdBy"] = req.user._id

    try{
        await newDepartment.save()
        res.send(newDepartment)

    }catch(e){
        res.status(400).send(e)
    }
})


//Gets all the data of a department



//that only returns data for one department
router.get('/', auth, authrole('admin'), async(req,res)=>{

    try{
        const dept =  await Department.findOne({"name": req.body.name})
        if(!dept){
            throw new Error("Department not found")
        }
        res.send(dept)

    }
    catch(e){
        console.log(e)
        res.status(404).send(e)
    }
})

module.exports = router

