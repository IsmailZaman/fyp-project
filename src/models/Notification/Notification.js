const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({

    //List of Session in which he/she has advised
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notifications: [{
        title: {type: String},
        text: {
            type:String
        },
        seen: {type: Boolean},
        link: {type: String} 
    }]
})

const Notifications = mongoose.model('Notification',notificationSchema)
module.exports= Notifications
