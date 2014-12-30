function randomString(length)
{
	var chars = "0123456789abcdef";
	var s = "";
	for(var i = 0; i < length; i++) s += chars[Math.round(Math.random()*(chars.length-1))];
	return s;
}

if(typeof module !== 'undefined') module.exports = randomString;
