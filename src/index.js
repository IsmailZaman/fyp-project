const app =require('./app')


app.get('/', (req,res)=>{
    res.send("HELLO WORLD")
})


app.listen(5000, ()=>{
    console.log("App is up on ", 5000)
})