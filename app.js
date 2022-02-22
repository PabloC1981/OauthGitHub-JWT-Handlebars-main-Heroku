import express from 'express';
import handlebars from 'express-handlebars';
import { __dirname } from './utils.js';
import config from './config.js';
import axios from 'axios';
import {URLSearchParams} from 'url';
import mongoose from 'mongoose';
import { users } from './model/User.js';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const app = express();
const connection = mongoose.connect(config.mongo.URL)
//VIEWS
app.engine('handlebars',handlebars.engine());
app.set('views',__dirname+'/views');
app.set('view engine','handlebars');

//MIDDLEWARES
app.use(express.static(__dirname+'/public'));
app.use(cookieParser());

const getGitHubUser = async (code) =>{
    const gitHubToken = await axios.post(`https://github.com/login/oauth/access_token?client_id=${config.github.CLIENT_ID}&client_secret=${config.github.CLIENT_SECRET}&code=${code}`)
                            .then(res=>res.data).catch(error=>{throw Error})
    const decodedToken = new URLSearchParams(gitHubToken);
    const access_token = decodedToken.get('access_token');

    return axios('https://api.github.com/user',{
        headers:{Authorization:`Bearer ${access_token}`}
    }).then(res=>res.data).catch(error=>{
        console.log("Couldn't get user from Github")
        throw error;
    })
}

app.get('/',(req,res)=>{
    res.render('Home',{
        github_auth:`https://github.com/login/oauth/authorize?client_id=${config.github.CLIENT_ID}&redirect_uri=http://localhost:8080/auth/github?path=/&scope=user:email`
    })
})

app.get('/auth/github',async (req,res)=>{
    const code = req.query.code;
    const path = req.query.path;
    if(!code) throw new Error('No code provided')
    const githubUser = await getGitHubUser(code);
    let {name,company,email,hireable,login} = githubUser;
    let exists = await users.findOne({email:email});
    let user;
    if(!exists){
        user = {name:name,job:company,email:email,hireable:hireable,username:login}
        await users.create(user);
        const token = jwt.sign(user.toJSON(),config.jwt.SECRET,{expiresIn:10000});
        return res.cookie('',token,{
            httpOnly:true,
            domain:"localhost"
        })
    }
    user = exists;
    const token = jwt.sign(user.toJSON(),config.jwt.SECRET,{expiresIn:10000});
    res.cookie(config.jwt.COOKIE_NAME,token,{
        httpOnly:true,
        domain:"localhost"
    })
    res.redirect('/')
})
app.get('/current',(req,res)=>{
    let cookie = req.cookies[config.jwt.COOKIE_NAME];
    if(!cookie) return res.status(401).send({error:"No token provided"})
    try{
        const decodedUser = jwt.verify(cookie,config.jwt.SECRET);
        res.send(decodedUser);
    }catch(err){
        res.send(null);
    }
})
app.get('/profile',(req,res)=>{
    let cookie = req.cookies[config.jwt.COOKIE_NAME];
    if(!cookie) return res.redirect('/');
    try{
        const decodedUser = jwt.verify(cookie,config.jwt.SECRET);
        res.render('Profile',{
            user:decodedUser
        })
    }catch(err){
        res.redirect('/');
    }
})
app.get('/logout',(req,res)=>{
    res.clearCookie(config.jwt.COOKIE_NAME);
    res.redirect('/');
})
app.listen(8080,()=>console.log("Now listening"))