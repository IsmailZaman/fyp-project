const Program = require('../../models/administration/program')
const Department = require('../../models/administration/department')
const router = require('express').Router()
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole



//In order to add a new program, we will need department. First we will check if the department exists. It it does, 
//we will store the new program in departments list of programs. E.g ComputerScience = [BSCS, MSCS]


router.post('/',auth,authrole('admin'),async(req,res)=>{
    console.log("HELLO")
    try{
        //"CHECK IF THE DEPARTMENT EXISTS"
        const dept = await Department.findOne({"name": req.body.department})
        if(!dept){
            throw new Error("Department not found")
        }
        
        req.body["createdBy"] = req.user._id
        req.body["department"] = dept._id

        console.log(req.body)
        
        const newProgram = new Program(req.body)
        await newProgram.save()

        dept.programs.push(newProgram._id)
        await dept.save()

        
        res.send(newProgram)

    }catch(e){
        console.log(e)
        res.status(400).send()
    }
})


module.exports = router