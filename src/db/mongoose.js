const mongoose = require('mongoose')

try{
    mongoose.connect("mongodb://ismail:mysecret@cluster0-shard-00-00.kz6yr.mongodb.net:27017,cluster0-shard-00-01.kz6yr.mongodb.net:27017,cluster0-shard-00-02.kz6yr.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-blzfbx-shard-0&authSource=admin&retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
    
)

}catch(e){
    console.log("Error in Connecting to the Online Database")
}
