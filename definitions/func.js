FUNC.preparetokens = function() {

	MAIN.tokens = {};

	if (PREF.tokens) {
		for (var token of PREF.tokens) {
			var obj = CLONE(token);
			MAIN.tokens[obj.token] = obj;
		}
	}

	if (MAIN.socket) {
		for (var key in MAIN.socket.connections) {
			var conn = MAIN.socket.connections[key];
			if (!MAIN.tokens[conn.user.token] && conn.user.token !== PREF.token)
				conn.close(4001);
		}
	}
};

FUNC.saveconfig = function() {
	var config = {};
	for (var item of F.extensions)
		config[item.id] = item.config;
	F.Fs.writeFile(PATH.databases('extensions.json'), JSON.stringify(config), NOOP);
};


FUNC.stats = function(session) {

	if (!MAIN.stats[session.token])
		MAIN.stats[session.token] = { total: 0, today: 0 };

	if (MAIN.stats[session.token].total)
		MAIN.stats[session.token].total++;
	else
		MAIN.stats[session.token].total = 1;

	if (MAIN.stats[session.token].today)
		MAIN.stats[session.token].today++;
	else
		MAIN.stats[session.token].today = 1;

	MAIN.stats.save();
};

ON('ready', function() {
	PREF.name && LOADCONFIG({ name: PREF.name, allow_tms: PREF.allow_tms, secret_tms: PREF.secret_tms });
	FUNC.preparetokens();
});