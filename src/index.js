const app =require('./app')
const PORT = process.env.PORT


app.get('/', (req,res)=>{
    res.send("HELLO WORLD")
})


app.listen(PORT, ()=>{
    console.log("App is up on ", PORT)
})