const mongoose = require('mongoose')

try{
    mongoose.connect(process.env.DB_STRING,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
    
)

}catch(e){
    console.log("Error in Connecting to the Online Database")
}
