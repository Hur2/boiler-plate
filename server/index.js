const express = require('express')
const app = express()
const port = 5000
const {User} = require('./models/User')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config/key')
const {auth} = require('./middleware/auth')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => res.send("Hello world!!"))

app.get('/api/hello', (req, res) => {
    res.send("Hello? 맨날 인사만 주구장창")
})

app.post('/api/users/register', (req, res) => {
    //회원가입시 필요한 정보를 client에서 가져온다.
    //그리고 이들을 데이터 베이스에 넣는다.

    const user = new User(req.body)
    user.save((err, userInfo) => {
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success:true
        })
    })
})

app.post('/api/users/login', (req, res) => {
    //이메일 확인
    User.findOne({email:req.body.email}, (err, userInfo) => {
        if(!userInfo) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
        //비밀번호 확인
        userInfo.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch)
                return res.json({loginSuccess:false, message:"비밀번호가 틀렸습니다."})
            
            //비밀번호까지 맞으면 토큰 생성.
            userInfo.generateToken((err,user) => {
                if(err) return res.status(400).send(err);

                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({loginSuccess:true, userId: user._id})
            })
        })
    })

})

app.get('/api/users/auth', auth, (req,res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0? false:true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image,
    })
})

app.get('/api/users/logout', auth, (req,res) => {
    User.findOneAndUpdate({ _id: req.user._id }, {token:""}, (err, user) => {
        if(err) return res.json({success: false, err});
        return res.status(200).send({
            success:true
        })
    })
})

//test3@naver.com
//24332

app.listen(port, () => console.log(`Example app listening on port ${port}!`))