const router = require('express').Router()
const User = require('../models/user')
const studentData = require('../models/studentData')
const auth = require('../middleware/auth').auth
const authrole = require('../middleware/auth').authrole


//Registration requests here. A token is generated on registration
// This is the admin registration. Only admins have access to this particular Route. 
router.post('/users', async (req,res)=>{
    
    const newUser = new User(req.body)
    newUser["role"] = "admin"
    try{
        const token = await newUser.generateAuthToken();
        res.send({newUser,token})
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})




//Login request. An authorization token is assigned to verified user
//Used for both students and admin
router.post('/users/login',async(req,res)=>{
    
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})

    }catch(e){
        res.status(400).send()
    }
})

//Request for creating Students. Only admins can use this route.

router.post('/users/student', auth, authrole("admin"), async(req,res)=>{
    const student = new studentData(req.body.studentData)
    student["createdBy"] = req.user._id


    const newUser = new User(req.body.userData)
    newUser["studentData"] = student._id
    newUser["role"] = "student"


    try{
        await newUser.save()
        await student.save()
        res.send(newUser)

    }catch(e){
        res.status(400).send(e)
    }
})





//Only returns the users own profile
router.get('/users/me',auth,async(req,res)=>{

    try{
        if(req.user.role == 'admin'){
            const user = await User.findById({_id: req.user._id})
            res.send(user)
        }
        else{
            const user = await User.findById({_id: req.user._id}).populate('studentData')
            console.log(user)
            res.send(user)
        }
        
    }catch(e){
        res.status(500).send()
    }
})




//Returns all the users. Should be only accessible to an admin
router.get('/users',auth,authrole("admin"),async(req,res)=>{
    try{
        const users = await User.find({})
        res.send(users)
    }catch(e){
        res.status(400).send()
    }
})




//Logs out a user, irrespective of his role
router.post('/users/logout', auth, async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})


//Logs out a user from all instances. Removes all tokens
router.post('/users/logoutall',auth,async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

//Student can change their passwords while logged in
router.patch('/users/changepassword',auth,async(req,res)=>{
    const _id = req.params.id
    try{
        

        const pass= await User.findOneAndUpdate({_id}, {$set:{password:req.body.password}},{useFindAndModify: false});
        res.send(pass)

    }
    catch(e)
    {
        res.status(404).send()
        console.log("Password can't be changed")
        

    }

})

//Admin can change Student Data(name, password, email)
//Find by email?
router.patch('/users/updateStudentData',auth,authrole("admin"),async(req,res)=>{
    
    //let fieldsToUpdate = req.body.toUpdate
    try{
    const std=await User.findOneAndUpdate({email:req.body.email},{"$set": { name: req.body.name,  password: req.body.password, email:req.body.em }},{useFindAndModify: false});
    res.send("Successful")
    }
    catch(e)
    {
    res.status(404).send()
    console.log("Data can't be changed")
    }      
})
//Delete a user
router.delete('/users/deleteUser',auth,authrole("admin"),async(req,res)=>
{
    try{
        //const user = await User.findOneAndDelete({email:req.body.email})
        const user = await User.findOne({email:req.body.email})
        if(!user){
            throw new Error("User not found")
        }
        const deletedUser = await User.findByIdAndDelete(user._id)
        console.log(deletedUser)
        const deleteUserData = await studentData.findByIdAndDelete(deletedUser.studentData)
        console.log(deleteUserData)

        res.send("Deleted")
    }
    catch(e)
    {
        res.status(404).send()
        console.log("User can't be deleted")
    }
})






module.exports = router




