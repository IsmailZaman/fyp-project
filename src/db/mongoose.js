
(async () => {
    const mongoose = require('mongoose')
    try {
      await mongoose.connect(`mongodb://${process.env.DB_CREDS}@cluster0-shard-00-00.kz6yr.mongodb.net:27017,cluster0-shard-00-01.kz6yr.mongodb.net:27017,cluster0-shard-00-02.kz6yr.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-blzfbx-shard-0&authSource=admin&retryWrites=true&w=majority`,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    } )
    } catch (err) {
      console.log('error: ' + err)
    }
  })()
