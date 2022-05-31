const router = require('express').Router()
const {auth,authrole} = require('../../middleware/auth')
const Batch = require('../../models/administration/batch')



router.post('/',auth,authrole('admin'), async(req,res)=>{
    const batch = new Batch()
    console.log(req.body.dept)
    batch['name'] = req.body.batch
    batch['department'] = req.body.dept
    console.log(batch)

    try{
        await batch.save()
        res.status(201).send('New Batch Added')
    }catch(e){
        res.status(400).send()
    }

})


router.get('/', auth,authrole('admin'), async(req,res)=>{
    try{
        const batches = await Batch.find({})
        if(!batches){
            throw new Error('Batches not found')
        }
        res.send(batches)
    }catch(e){
        res.status(404).send()
    }
})
module.exports = router