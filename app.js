var http = require('http'),
	url = require('url'),
	colors = require('./colorHelper'),
	config = require('./config.json'),
	util = require('util');

function startServerWithProxyInfo(host, port){
	var server = http.createServer(function (req, res) {
		requestProxy({
			host : host,
			port : port || 80,
			path : req.url || '/',
			method : req.method || 'GET'
		}, res);
	});
	server.listen(0);

	console.log(
		util.format(
			'Proxy server for "%s" running at \n\t\n\thttp://localhost:%d\n', 
			host + ':' + (port || 80),
			server.address().port)
		);
}

function requestProxy(requestOption, res){
	if(requestOption !== null){
		http.request(requestOption, function(innerResponse){
			res.writeHead(innerResponse.statusCode, innerResponse.headers);
			console.log(colors.green(requestOption.method) + ' ' + colors.purplered(innerResponse.statusCode) + ' ' + requestOption.path);

			innerResponse.on('data', function(chunk){
				res.write(chunk, 'binary');
			});

			innerResponse.on('end', function(){
				res.end();
			});
		}).end();	
	}
}

function getCommandParam(){
	var args = process.argv.slice(2);
	var template = { name : null, host : null, port : null };
	var paramRegex = /^\-[a-z]+\=[a-z0-9]+/i;

	var param;
	args.forEach(function(elem, idx){
		if(paramRegex.test(elem)){
			var keyValue = elem.toLowerCase().replace('-', '').split('=');
			if(keyValue[0] in template){
				param = param || {};
				param[keyValue[0]] = keyValue[1];
			}
		}
	});
	return param;
}

function getHelpString(){
	return [ 
			' Usage : ',
			'\n',
			util.format('    %s : use the host and port according to the name in config.json file.', colors.green('-name')),
			'\n',
			util.format('          : and the host/port will be ignored if use -name.'),
			'\n',
			'   OR',
			'\n',
			util.format('    %s : host name like "www.google.com".', colors.green('-host')),
			'\n',
			util.format('    %s : port number of the host. default 80', colors.green('-port')),
			'\n'
		].join('');
}

function runByName(name){
	if((name in config) === false){
		console.log('sorry, can not find "' + name + '" in config.json file.');
		return;		
	}
	startServerWithProxyInfo(config[name].host, config[name].port);
}

function runByHost(host, port){
	startServerWithProxyInfo(host, port);	
}

function run(){
	var param = getCommandParam();
	if(param == null){
		console.log(getHelpString());
	}else if(param.name){
		runByName(param.name);
	}else if(param.host){
		runByHost(param.host, param.port);
	}
}

run();