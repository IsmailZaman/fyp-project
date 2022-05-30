const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async(req,res,next)=>{
    
    try{
        
        const token = req.header('Authorization').replace("Bearer ", "");
        
        if(!token){
            throw new Error('token ')
        }

        const decoded = jwt.verify(token,process.env.ACCESS_SECRET)

        const user = await User.findOne({_id: decoded._id})

        if(!user){
            throw new Error()
        }

        req.token = token
        req.user = user
        next()


    }catch(e){
        if(e.message === 'jwt expired'){
            
            res.status(403).send("Forbidden")
        }
        else{
            res.status(401).send("Please Authenticate")
        }
        
    }
}

const authrole = function(role){

    return (req,res,next)=>{
        let found = false
        if(Array.isArray(role)){
            for(i in role){
                if(req.user.roles.includes(role[i])){
                    found = true
                }
            }
        }
        
        if(!Array.isArray(role) || found === false){
            if(!req.user.roles.includes(role)){
                res.status(401).send('Not Allowed')
            }
        }
        
        next() 
    }
}

module.exports = {auth, authrole}