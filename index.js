const express = require('express')
const app = express()
const port = 5000
const {User} = require('./models/User')
const bodyParser = require('body-parser')
const config = require('./config/key')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/', (req,res) => res.send("Hello world!!"))

app.post('/register', (req, res) => {
    //회원가입시 필요한 정보를 client에서 가져온다.
    //그리고 이들을 데이터 베이스에 넣는다.

    const user = new User(req.body)
    user.save((err,doc) => {
        if(err) return res.json({sucess: false, err})
        return res.status(200).json({
            sucess:true
        })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))