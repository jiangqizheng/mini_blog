var fs = require("fs");
var path = require("path");
var formidable = require("formidable");
var gm = require("gm");
var md5 = require("../models/md5.js");
var userdb = require("../models/userdb.js");
var articledb = require("../models/articledb.js");


// showIndex-显示主页
exports.showIndex = function(req, res, next) {
	// 判断登入
	// 查找用户信息
	if (req.session.login == "1") {
		var username = req.session.username;
		var login = true;
	} else {
		var username = "youke";
		var login = false;
	};
	userdb.findOne({
		username: username
	}, function(err, result) {
		res.render("index", {
			"login": login,
			"username": username,
			"active": "index",
			"avatar": login ? result.avatar : "default/default_visitor.jpg",
		});
	});
};


// showRegist-显示注册页
exports.showRegist = function(req, res, next) {
	res.render("regist", {
		"login": req.session.login == "1" ? true : false,
		"username": req.session.login == "1" ? req.session.username : "",
		"active": "regist"
	});
}

// doRegist-处理注册事项
// 返回数据格式为 {"result": "number"}	为确保数据统一性，反馈数据中数字为string格式
// "-1" 解析post请求失败|调用数据库失败		"0" 用户名重复		"8" 成功
exports.doRegist = function(req, res, next) {
	var form = new formidable.IncomingForm();
	// 解析post请求
	form.parse(req, function(err, fields) {
		var username = fields.username;

		userdb.findOne({
			username: username
		}, function(err, result) {
			if (result) {
				res.send("0");
				return;
			};
			// md5加密,创建用户对象
			var password_md5 = md5(md5(fields.password) + md5("jiangqizheng"));
			userdb.create({
				username: username,
				password: password_md5,
			}, function(err, result) {
				req.session.login = "1";
				req.session.username = username;
				res.send("8");
			});
		});
	});
};


// showLogin-显示登入页
exports.showLogin = function(req, res, next) {
	res.render("login", {
		"login": req.session.login == "1" ? true : false,
		"username": req.session.login == "1" ? req.session.username : "",
		"active": "login"
	});
};

// 禁止注册为youke
// doLogin-处理登入事项
// 返回数据格式为 {"result": "number"}	为确保数据统一性，反馈数据中数字为string格式
// "-1" 解析post请求失败|调用数据库失败		"0" 用户名不存在		"1" 密码错误		"8" 成功
exports.doLogin = function(req, res, next) {
	var form = new formidable.IncomingForm();
	// 解析post请求
	form.parse(req, function(err, fields) {
		var username = fields.username;

		userdb.findOne({
			username: username
		}, function(err, result) {
			if (!result) {
				res.send("0")
			} else {
				// 验证密码
				var password_md5 = md5(md5(fields.password) + md5("jiangqizheng"));
				if (result.password == password_md5) {
					req.session.login = "1";
					req.session.username = username;
					res.send("8");
				} else {
					res.send("1");
				};
			};
		});
	});
};


//  头像上传
exports.showUpavatar = function(req, res, next) {
	if (req.session.login != "1") {
		res.send("警告！您还未登入！");
		return;
	} else {
		res.render("upavatar", {
			"login": true,
			"username": req.session.username,
			"active": "setavatar"
		});
	};
};


exports.doUpavatar = function(req, res, next) {
	var form = new formidable.IncomingForm();
	form.uploadDir = path.normalize(__dirname + "/../avatar");
	form.parse(req, function(err, fields, files) {
		// 限制大小为1M之内
		var avatarsizr = 1024 * 1024 * 1
		if (form.bytesReceived > avatarsizr) {
			//fs.unlink 删除超出大小的文件
			fs.unlink(files.avatar.path, function() {
				res.send("文件大小超出限制");
				return;
			});
		} else {
			// var extname = path.extname(files.avatar.name).toLowerCase();	留用，是否允许使用动态头像以及其他
			var oldpath = files.avatar.path;
			var newpath = path.normalize(__dirname + "/../avatar") + "/" + req.session.username + ".jpg";
			fs.rename(oldpath, newpath, function(err) {
				if (err) {
					res.send("上传失败");
					return;
				};
				// 处理图像大小,缩放或放大图像,统一尺寸(不设置等比例),长宽最大为500;
				req.session.avatar = req.session.username + ".jpg";
				var filename = req.session.avatar;
				gm("./avatar/" + filename)
					.resize(500, 500)
					.write("./avatar/" + filename, function(err) {
						if (err) {
							res.send("系统错误:比例修改");
							return;
						};
						// 强制跳转到头像处理页
						res.redirect("/setavatar");
					});
			});
		};
	});
};



// 处理头像
exports.showSetavatar = function(req, res, next) {
	if (req.session.login != "1") {
		res.send("访问此页面前必须登入！");
		return;
	} else {
		res.render("setavatar", {
			"login": true,
			"username": req.session.username,
			"active": "setavatar",
			"avatar": req.session.avatar,
		});
	};
};


// 执行
exports.doSetavatar = function(req, res, next) {
	//这个页面接收几个GET请求参数
	//文件名、w、h、x、y
	var filename = req.session.avatar;
	var w = req.query.w;
	var h = req.query.h;
	var x = req.query.x;
	var y = req.query.y;

	gm("./avatar/" + filename)
		.crop(w, h, x, y)
		.resize(100, 100, "!")
		.write("./avatar/" + filename, function(err) {
			if (err) {
				res.send("-1");
				return;
			};
			// 将数据写入数据库
			userdb.update({
				username: req.session.username
			}, {
				$set: {
					avatar: req.session.avatar
				}
			}, function(err, result) {
				res.send("1");
			});
		});
};


// 发表内容posttext
exports.doPosttext = function(req, res, next) {
	if (req.session.login != "1") {
		res.send("访问此页面前必须登入！");
		return;
	};
	var form = new formidable.IncomingForm();
	// 解析post请求
	form.parse(req, function(err, fields) {
		var content = fields.content;
		articledb.create({
			username: req.session.username,
			content: content,
			date: new Date(),
		}, function(err, result) {
			res.send("1");
		});
	});
};


// 获取用户内容
// 主意！此处使用原生mongodb！
exports.getAlltext = function(req, res, next) {
	var page = parseInt(req.query.page);
	var item = parseInt(req.query.item);
	var pageitem = item * page;

	articledb.find({}, null, {
		skip: pageitem,
		limit: item,
		sort: {
			"date": -1
		}
	}, function(err, result) {
		res.json({
			"result": result
		});
	});
};


// 获取用户信息
exports.getUserinfo = function(req, res, next) {
	var username = req.query.username;

	userdb.findOne({
		username: username
	}, function(err, result) {
		var obj = {
			"username": result.username,
			"avatar": result.avatar,
			"_id": result._id,
		};
		res.json({
			"result": obj
		});
	});
};


// 展示个人所有资料
exports.showUser = function(req, res, next) {
	var login = req.session.login == "1" ? true : false;
	if (req.session.login != "1") {
		res.render("user", {
			"login": login,
			"username": "",
			"active": "",
			"avatar": "",
			"content": "",
		});
		return;
	};
	// params用于解析:后面的内容
	var username = req.params["username"];

	articledb.find({
		username: username
	}, function(err, result) {
		userdb.findOne({
			username: username
		}, function(err, result2) {
			res.render("user", {
				"login": login,
				"username": username,
				"active": "user",
				"avatar": result2.avatar,
				"content": result,
			});
		});
	});
};


// 显示所有注册用户
exports.showUserlist = function(req, res, next) {
	var login = req.session.login ? true : false;
	userdb.find({}, function(err, result) {
		res.render("userlist", {
			"username": login ? req.session.username : "youke",
			"login": login,
			"users": result,
			"active": "userlist"
		});
	});
};