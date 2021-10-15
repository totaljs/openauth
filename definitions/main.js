MAIN.version = 1;
MAIN.stats = MEMORIZE('stats');
MAIN.tokens = {};
MAIN.sessions = {};

ON('ready', function() {
	PREF.name && LOADCONFIG({ name: PREF.name, allow_tms: PREF.allow_tms, secret_tms: PREF.secret_tms });
	FUNC.preparetokens();
});

MAIN.oauth = {};

ON('service', function() {

	for (var key in MAIN.sessions) {
		var session = MAIN.sessions[key];
		if (session.expire <= NOW)
			delete MAIN.sessions[key];
	}

	if (NOW.getHours() === 0 && NOW.getMinutes() === 0) {
		for (var key in MAIN.stats) {
			if (MAIN.stats[key].today) {
				for (var subkey in MAIN.stats[key].today)
					MAIN.stats[key].today[subkey] = 0;
			}
		}
	}

});