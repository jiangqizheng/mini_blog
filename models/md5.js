var crypto = require("crypto");
module.exports = function(password) {
	var md5 = crypto.createHash("md5");
	var result = md5.update(password).digest("base64");
	return result;
}