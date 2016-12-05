var mongoose = require("mongoose");
// var db = mongoose.createConnection("mongodb://localhost/call");操作多个数据库,通过db生成model
mongoose.connect("mongodb://localhost/call");
var db = mongoose.connection;

db.on("error", console.error.bind("console", "connection:err"));
db.once("open", console.log.bind("console", "数据库连接成功"));