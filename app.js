var express = require("express");
var app = express();
var db = require("./models/db.js");
var router = require("./router/router.js");
var session = require('express-session');



// ejs模板引擎
app.set("view engine", "ejs");

// 设置session
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 1000 * 60 * 60,
	}
}));

// 静态资源
app.use(express.static("./public"));
app.use("/avatar", express.static("./avatar"));


// 路由
app.get("/", router.showIndex); //显示首页
app.get("/regist", router.showRegist); //显示注册页
app.post("/doregist", router.doRegist); //执行注册，ajax
app.get("/login", router.showLogin); //显示登录页面
app.post("/dologin", router.doLogin); //执行登录，ajax
app.get("/upavatar", router.showUpavatar); //显示设置头像页面
app.post("/doupavatar", router.doUpavatar); //执行设置头像，ajax
app.get("/setavatar", router.showSetavatar); //裁剪头像
app.get("/dosetavatar", router.doSetavatar); //执行裁剪头像
app.post("/posttext", router.doPosttext); //执行用户发表内容
app.get("/getalltext", router.getAlltext); //ajax服务，列出所有发布内容
app.get("/getuserinfo", router.getUserinfo); //ajax服务，获取用户信息
app.get("/user/:username", router.showUser) //显示用户个人空间
app.get("/post/:id", router.showUser) //显示用户个人空间
app.get("/userlist", router.showUserlist) //显示所有注册用户


// 默认监听3000端口
app.listen(3000, console.log.bind("console", "listen in 3000 ......"));