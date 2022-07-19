const Session = require('../../models/Enrollment/session')

const router = require('express').Router()
const auth = require('../../middleware/auth').auth
const authrole = require('../../middleware/auth').authrole


router.get('/', auth,async(req,res)=>{
    
})



//enrol student into offered courses in the current session

router.post('/enroll', auth,authrole('advisor'),async(req,res)=>{
    try{
        const activeSession = await Session.findOne({status: true })
        if(!activeSession) throw new Error('active session not found.')

        console.log(req.body)
        res.send(req.body)

    }catch(e){
        res.status(400).send()
    }
})









module.exports = router
