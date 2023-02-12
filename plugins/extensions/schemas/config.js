NEWSCHEMA('Extensions/Config', function(schema) {

	schema.action('read', {
		name: 'Read configuration',
		params: '*id',
		permissions: 'extensions',
		action: function($) {
			var extension = F.extensions.findItem('id', $.params.id);
			if (extension) {
				var model = {};
				model.id = extension.id;
				model.readme = extension.readme;
				model.name = extension.name;
				model.configuration = extension.configuration;
				model.config = extension.config;
				$.callback(model);
			} else
				$.invalid('@(Extension not found)');
		}
	});

	schema.action('save', {
		name: 'Save configuration',
		input: '*id,data:Object',
		permissions: 'extensions',
		action: function($, model) {
			var extension = F.extensions.findItem('id', model.id);
			if (extension) {
				extension.config = model.data;
				extension.configure && extension.configure(extension.config);
				$.success();
				FUNC.saveconfig();
			} else
				$.invalid(404);
		}
	});

});