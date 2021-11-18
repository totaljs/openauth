NEWSCHEMA('Login', function(schema) {

	schema.define('serviceid', String, true);  // service e.g. facebook, google
	schema.define('sessionid', String, true);  // session ID
	schema.define('url', String);              // optional, redirect URL

	schema.addWorkflow('exec', function($, model) {


		var service = MAIN.oauth[model.serviceid];
		if (!service) {
			$.invalid('@(Service not found)');
			return;
		}

		if (service) {

			var is = true;

			if (service.configuration) {
				for (var item of service.configuration) {
					if (item.required && !service.config[item.name]) {
						is = false;
						break;
					}
				}
			}

			if (!is) {
				$.invalid('@(Service is not configured)');
				return;
			}
		}


		var id = Date.now().toString(36) + GUID(10);
		model.id = id;
		model.token = $.user.token;
		model.expire = NOW.add('15 minutes');
		model.redirecturl = $.controller.hostname('/oauth/' + model.serviceid + '/');
		MAIN.sessions[id] = model;
		$.callback($.controller.hostname('/login/' + id + '/'));
		FUNC.stats($.user);
	});

});