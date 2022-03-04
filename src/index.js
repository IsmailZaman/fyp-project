const app =require('./app')


app.get('/', (req,res)=>{
    res.send("HELLO WORLD")
})


app.listen(3000, ()=>{
    console.log("App is up on ", 3000)
})