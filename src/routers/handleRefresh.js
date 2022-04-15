const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/user')


const handleResfreshToken = async(req,res)=>{
    
    const cookies = req.cookies
    if(!cookies?.jwt) res.sendStatus(401)

    const refreshToken = cookies.jwt

    try{
        const user = await User.findOne({'tokens.token': refreshToken})
        if(!user){
            return
            
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET)

        if(decoded._id != user._id.toString()){
            return
            
        }
        
        const accessToken = jwt.sign({_id: user._id.toString()}, process.env.ACCESS_SECRET,{expiresIn: 60*15})
        const roles = user.roles
        
        return res.json({accessToken, roles})
        


    }catch(e){
        
        return res.status(403).send('Forbidden')
    }
}

router.get('/', handleResfreshToken)

module.exports = router