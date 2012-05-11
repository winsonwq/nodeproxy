function green(text){
	return '\033[1;30;32m' + text + '\033[0m';
}

function purplered(text){
	return '\033[1;30;35m' + text + '\033[0m';	
}

exports.green = green;
exports.purplered = purplered;