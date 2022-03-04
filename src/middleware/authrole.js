const authrole = function(role){

    return (req,res,next)=>{
        if(role !== req.user.role){
            res.status(401).send('Not Allowed')
        }
        next() 
    }
}

module.exports = authrole
