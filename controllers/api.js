exports.install = function() {

	// OAuth 2
	ROUTE('GET      /login/{id}/', login);
	ROUTE('GET      /oauth/{id}/', callback);
	ROUTE('POST     /oauth/{id}/', callback);
	ROUTE('GET      /oauth/{id}/remove/', remove);
	ROUTE('+GET     /sessions/', sessions);
	ROUTE('+POST    / *Extensions --> login');

	// Index
	ROUTE('GET /', index);
};

function index() {
	if (CONF.token)
		this.plain(CONF.name);
	else
		this.redirect('/setup/');
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

				DB().insert('nosql/logs', { id: response.id, serviceid: session.serviceid, sessionid: session.sessionid, name: response.name, email: response.email, expire: response.expire, dtcreated: new Date() });

				response.sessionid = session.sessionid;
				response.serviceid = session.serviceid;
				session.response = response;

				if (session.url) {
					session.url += (session.url.indexOf('?') === -1 ? '?' : '&') + 'sessionid=' + response.sessionid;
					$.redirect(session.url);
				} else
					$.view('close');
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