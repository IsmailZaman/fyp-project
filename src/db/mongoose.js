
(async () => {
    const mongoose = require('mongoose')
    try {
      await mongoose.connect(process.env.DB_STRING,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    } )
    } catch (err) {
      console.log('error: ' + err)
    }
  })()
