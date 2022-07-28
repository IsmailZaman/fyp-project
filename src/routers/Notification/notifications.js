const Notifications = require('../../models/Notification/Notification')

const router = require('express').Router()
const auth = require('../../middleware/auth').auth



//get top 10 notifications. 
router.get('/',auth, async(req,res)=>{
    try{
        console.log('top 10 entered')
        const userNotification = await Notifications.findById(req.user.notifications)
        console.log(userNotification)
        
        let topNotifications = []
        if(userNotification.notifications.length > 10){
            topNotifications = userNotification.notifications.slice(-10)
            topNotifications.reverse()
        }else{
            topNotifications = userNotification.notifications
            topNotifications.reverse()
        }
        
        res.send(topNotifications)

    }catch(e){
        res.status(404).send(e.message)
    }
})


















module.exports = router
