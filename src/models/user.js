const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');



const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    email: {
        type:String,
        required: true,
        unique: true
    },
    role:{
        type:String
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
    }

},{timestamps: true})


userSchema.methods.generateAuthToken = async function(){
    const user =this;
    const token = jwt.sign({_id: user._id.toString()}, "mysecret",{expiresIn: '24h'})
    
    user.tokens = user.tokens.concat({token})
    
    await user.save()
    return token
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