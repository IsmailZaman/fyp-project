const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');



const userSchema = new mongoose.Schema({
    name:{
        type: String,
        lowercase:true
    },
    password:{
        type:String,
        required: true
    },
    email: {
        type:String,
        required: true,
        unique: true,
        lowercase:true
    },
    roles:[String],
    notifications: {
        type: mongoose.Schema.Types.ObjectId
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    studentData:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'studentData'
    },
    advisorData:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'advisorData'
    }

},{timestamps: true})


userSchema.methods.generateAuthToken = async function(){
    const user =this;
    const accessToken = jwt.sign({_id: user._id.toString()},process.env.ACCESS_SECRET ,{expiresIn: '1h'})
    
    const refreshToken = jwt.sign({_id: user._id.toString()}, process.env.REFRESH_SECRET,{expiresIn: '1d'}) // this is the refresh token
    user.tokens = user.tokens.concat({token: refreshToken})
    
    await user.save()
    return {accessToken, refreshToken}
}


userSchema.statics.findByCredentials = async(email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        console.log("User not found")
        throw new Error('Unable to login')
    }

    if(user.password !== password){
        throw new Error('Unable to login')
    }

    return user;
}

userSchema.methods.toJSON = function(){
    const user= this

    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    return userObject
}




const User = mongoose.model('User', userSchema)

module.exports = User
