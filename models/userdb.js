var mongoose = require("mongoose");

// 设置Schema————
var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	avatar: {
		type: String,
		default: "default/default_user.jpg"
	},
	article: [String],
});
// ————设置Schema



// 设置index————
userSchema.index({
	username: 1
});
// ————设置index

var userdb = mongoose.model("user", userSchema);

module.exports = userdb;