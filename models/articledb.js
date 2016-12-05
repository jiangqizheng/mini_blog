var mongoose = require("mongoose");

// 设置Schema————
var articleSchema = new mongoose.Schema({
	username: String,
	content: String,
	date: Date,
});
// ————设置Schema



// 设置index————
articleSchema.index({
	username: 1
});
// ————设置index


// 设置statics方法————

// 查找 数量
articleSchema.statics.finditem = function(json, item, page, sort) {
	var result = [];
	var obj = this.model("article").find(json).skip(skipnumber).limit(limit).sort(sort)
}



// ————设置static方法



var articledb = mongoose.model("article", articleSchema);

module.exports = articledb;