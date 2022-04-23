const Program = require('../../models/administration/program')
const Department = require('../../models/administration/department')
const router = require('express').Router()
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole



//CREATES A NEW DEPARTMENT

router.post('/',auth,authrole('admin'),async(req,res)=>{
    const newDepartment = new Department(req.body)
    newDepartment["createdBy"] = req.user._id

    try{
        await newDepartment.save()
        res.status(201).send(`Created ${newDepartment.name} department.`)

    }catch(e){
        res.status(400).send(e)
    }
})


//Gets all the data of a department
router.get('/', auth, async(req,res)=>{
    try{
        const depts = await Department.find({}).select('name')
        if(!depts){
            throw new Error("Departments not found")
        }
        res.send(depts)
    }catch(e){
        res.status(404).send()
    }
})


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

