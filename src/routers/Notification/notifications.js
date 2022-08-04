const Notifications = require('../../models/Notification/Notification')

const router = require('express').Router()
const auth = require('../../middleware/auth').auth



//get top 10 notifications. 
router.get('/',auth, async(req,res)=>{
    try{
        const userNotification = await Notifications.findById(req.user.notifications)
        
        
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


//marks the list of notifications read
router.patch('/', auth, async(req,res)=>{

    try{
        const notificationsRead = req.body
        

        const notification = await Notifications.findById(req.user.notifications)

        notification.notifications.forEach((obj)=>{
            if(notificationsRead.includes(obj._id.toString())){
                obj.seen = true
            }
        })

  
        await notification.save()
        

        res.status(201).send()

    }catch(e){
        res.status(400).send()

    }
})

router.get('/unread/number', auth, async(req,res)=>{
    try{
        let unread = await Notifications.findById(req.user.notifications)
        if(!unread) throw new Error("Notifications not found in db.")
        unread = unread.notifications.filter((note)=> note.seen === false)

        
        res.send(String(unread.length))
    }catch(e){
        res.status(404).send(e.message)
    }




})

















module.exports = router
