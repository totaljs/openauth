exports.id = 'facebook';
exports.name = 'Facebook';
exports.author = 'Peter Sirka';
exports.icon = 'fab fa-facebook';
exports.version = '1.0.0';
exports.summary = 'OAuth 2.0 for Facebook';

exports.readme = `
- A callback endpoint \`{0}/oauth/facebook/\``;

exports.configuration = [];
exports.configuration.push({ name: 'id', text: 'App ID', type: 'string', required: true, placeholder: 'Application identifer' });
exports.configuration.push({ name: 'secret', text: 'Secret', type: 'string', required: true, placeholder: 'A secret key' });

exports.config = {};

exports.make = function() {

	var obj = {};

	obj.login = function(controller, session) {
		controller.redirect('https://graph.facebook.com/oauth/authorize?type=web_server&client_id={0}&redirect_uri={1}&scope=email&state={2}'.format(exports.config.id, encodeURIComponent(session.redirecturl), session.id));
	};

	obj.callback = function(controller, session, callback) {

		var code = controller.query.code;

		if (!code) {
			callback('Invalid code');
			return;
		}

		RESTBuilder.GET('https://graph.facebook.com/oauth/access_token?client_id={0}&redirect_uri={1}&client_secret={2}&code={3}'.format(exports.config.id, session.redirecturl, exports.config.secret, code)).exec(function(err, response) {
			if (response.access_token) {
				var url = 'https://graph.facebook.com/me?&fields=email,first_name,last_name,gender,hometown,locale,name,id,timezone,picture&access_token=' + response.access_token;
				RESTBuilder.GET(url).exec(function(err, profile, output) {
					if (output.status === 200) {
						var model = {};
						model.id = profile.id;
						model.nick = profile.nick;
						model.name = profile.name;
						model.firstname = profile.first_name;
						model.lastname = profile.last_name;
						model.email = profile.email;
						model.gender = (profile.gender ? profile.gender.toLowerCase() : '');
						model.response = profile;
						model.picture = profile.picture && profile.picture.data ? profile.picture.data.url : '';
						model.access_token = response.access_token;
						model.expire = NOW.add(response.expires_in + ' seconds');
						callback(null, model);
					} else
						callback(response.error ? response.error.message : err.message);
				});
			} else
				callback(response.error ? response.error.message : err.message);
		});

	};

	MAIN.oauth.facebook = obj;

};

exports.uninstall = function() {
	delete MAIN.oauth.facebook;
};