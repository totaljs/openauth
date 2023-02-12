NEWSCHEMA('Extensions', function(schema) {

	schema.action('list', {
		name: 'List of extensions',
		permissions: 'extensions',
		action: function($) {
			var arr = [];
			for (var item of F.extensions)
				arr.push({ id: item.id, name: item.name, icon: item.icon, color: item.color, author: item.author, version: item.version, summary: item.summary, readme: !!item.readme, setup: item.configuration && item.configuration.length > 0 ? true : false });
			$.callback(arr);
		}
	});

	schema.action('save', {
		name: 'Save extension',
		input: '*body:String',
		permissions: 'extensions',
		action: function($, model) {
			NEWEXTENSION(model.body, function(err, module) {

				if (err) {
					$.invalid(err);
					return;
				}

				var dir = PATH.databases('extensions');
				PATH.mkdir(dir, true);
				F.Fs.writeFile(PATH.join(dir, module.id + '.js'), model.body, NOOP);
				$.success(true, module.name);
			});
		}
	});

	schema.action('remove', {
		name: 'Remove extension',
		params: '*id:String',
		action: function($) {
			var params = $.params;
			var item = F.extensions.findItem('id', params.id);
			if (item) {
				F.Fs.unlink(PATH.join(PATH.databases('extensions'), item.id + '.js'), NOOP);
				item.remove();
				$.success();
				FUNC.saveconfig();
			} else
				$.invalid('@(Extension not found)');
		}
	});

	schema.action('download', {
		name: 'Download extension',
		params: '*id:String',
		action: function($) {
			var params = $.params;
			var item = F.extensions.findItem('id', params.id);
			if (item) {
				F.Fs.readFile(PATH.join(PATH.databases('extensions'), item.id + '.js'), function(err, response) {
					if (response)
						$.success(response.toString('utf8'));
					else
						$.invalid(404);
				});
			} else
				$.invalid('@(Extension not found)');
		}
	});

	schema.action('readme', {
		name: 'Readme',
		params: '*id:String',
		action: function($) {
			var item = F.extensions.findItem('id', $.id);
			if (item)
				$.callback(item.readme || '');
			else
				$.invalid(404);
		}
	});

	schema.action('login', {
		name: 'Login',
		input: '*serviceid:String, *sessionid:String, url:String',
		action: function($, model) {

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
		}
	});

	schema.action('logs', {
		name: 'Logs',
		permissions: 'profiles',
		action: function($) {
			DB().list('nosql/logs').autoquery($.query, 'id,serviceid,sessionid,name,email,expire,dtcreated', 'dtcreated_desc', 100).callback($);
		}
	});

	// Auto-load extensions
	(function() {

		var dir = PATH.databases('extensions');
		PATH.mkdir(dir);

		// Load configuration
		F.Fs.readFile(PATH.databases('extensions.json'), function(err, buffer) {
			var config = buffer ? buffer.toString('utf8').parseJSON(true) : {};
			F.Fs.readdir(dir, function(err, files) {
				files.wait(function(item, next) {
					F.Fs.readFile(PATH.join(dir, item), function(err, response) {
						if (response) {
							NEWEXTENSION(response.toString('utf8'), function(err) {
								err && F.error(err, 'NEWEXTENSION(\'{0}\''.format(item));
								next();
							}, module => module.config = config[module.id]);
						} else
							next();
					});
				});
			});
		});
	})();

});