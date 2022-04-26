exports.install = function() {

	ROUTE('GET      /', index);
	ROUTE('+SOCKET  /', socket, 1024);
	ROUTE('+POST    / *Login --> exec');
	ROUTE('+GET     /sessions/', sessions);

	// OAuth 2
	ROUTE('GET      /login/{id}/', login);
	ROUTE('GET      /oauth/{id}/', callback);
	ROUTE('POST     /oauth/{id}/', callback);
	ROUTE('GET      /oauth/{id}/remove/', remove);

	ROUTE('+GET /test/', function() {
		var self = this;
		EXEC('+Login --> exec', { sessionid: '123456', serviceid: 'apple' }, function(err, response) {
			self.redirect(response);
		}, self);
	});
};

function index() {
	if (PREF.token)
		this.plain('OpenAuth v' + MAIN.version);
	else
		this.redirect('/setup/');
}

function socket() {

	var self = this;

	self.sendmeta = function(client) {
		var msg = { type: 'init', name: PREF.name, version: MAIN.version, id: 'OpenAuth' };
		if (client)
			client.send(msg);
		else
			self.send(msg);
	};

	self.on('open', function(client) {
		client.dtconnected = new Date();
		self.sendmeta(client);
	});

	self.on('message', function(client, msg) {
		if (msg.type === 'login') {
			EXEC('+Login --> exec', msg.data, function(err, response) {
				msg.error = err;
				msg.response = response;
				msg.data = undefined;
				client.send(msg);
			}, client);
		} else if (msg.type === 'session') {
			for (var key in MAIN.sessions) {
				if (MAIN.sessions[key].sessionid === (msg.id || msg.sessionid)) {
					msg.response = MAIN.sessions[key].response;
					client.send(msg);
					return;
				}
			}
			msg.error = 'Session not found';
			msg.status = 404;
			client.send(msg);
		} else if (msg.type === 'sessions') {
			var arr = [];
			for (var key in MAIN.sessions) {
				var session = MAIN.sessions[key];
				if (session.response)
					arr.push(session.response);
			}
			msg.response = arr;
			client.send(msg);
		}
	});

	MAIN.socket = self;
}

function login(id) {
	var $ = this;
	var session = MAIN.sessions[id];
	if (session) {
		var service = MAIN.oauth[session.serviceid];
		if (service) {
			$.cookie('ssid', session.id, '1 hour');
			service.login($, session);
		} else {
			$.status = 409;
			$.invalid('Service is not supported');
		}
	} else {
		$.status = 404;
		$.invalid('Session not found');
	}
}

function remove() {
	// Not implemented
	this.plain('Your profile has been removed');
}

function callback(type) {

	var $ = this;
	var ssid = $.query.state || $.body.state;

	if (!$.query.openauth && !ssid) {
		$.view('oauth', $.body);
		return;
	}

	var service = MAIN.oauth[type];
	if (service) {

		if (!ssid)
			ssid = $.cookie('ssid') || $.query.ssid;

		var session = MAIN.sessions[ssid];
		if (session) {
			service.callback($, session, function(err, response) {

				if (err) {
					$.invalid(err);
					return;
				}

				response.sessionid = session.sessionid;
				response.serviceid = session.serviceid;
				session.response = response;

				F.$events.login && EMIT('login', response);
				CONF.allow_tms && F.tms.publish_cache.login && F.tms.publishers.login && PUBLISH('login', response);

				if (session.url) {
					session.url += (session.url.indexOf('?') === -1 ? '?' : '&') + 'sessionid=' + ssid;
					$.redirect(session.url);
				} else {
					MAIN.socket && MAIN.socket.send({ type: 'profile', serviceid: session.serviceid, sessionid: session.sessionid, data: response });
					$.view('close');
				}

			});
		} else {
			$.status = 404;
			$.invalid('Session not found');
		}
	} else {
		$.status = 409;
		$.invalid('Service is not supported');
	}
}

function sessions() {

	var $ = this;
	var sessionid = $.query.id || $.query.sessionid;

	if (sessionid) {
		for (var key in MAIN.sessions) {
			var session = MAIN.sessions[key];
			if (session.response && session.sessionid === sessionid) {
				$.json(session.response);
				return;
			}
		}
		$.status = 404;
		$.invalid('Session not found');
		return;
	}

	var arr = [];
	for (var key in MAIN.sessions) {
		var session = MAIN.sessions[key];
		if (session.response)
			arr.push(session.response);
	}

	$.json(arr);
}