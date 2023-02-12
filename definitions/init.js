var db = MAIN.db = MEMORIZE('data');

if (!db.tokens)
	db.tokens = [];

if (!db.config)
	db.config = {};

var config = db.config;

if (!config.name)
	config.name = 'OpenAuth';

if (!config.cdn)
	config.cdn = '//cdn.componentator.com';

// Fixed settings
CONF.allow_custom_titles = true;
CONF.version = '1';
CONF.op_icon = 'ti ti-lock';
CONF.op_path = '/setup/';

// Loads configuration
LOADCONFIG(db.config);

// Additional variables
MAIN.cache = {};
MAIN.oauth = {};
MAIN.sessions = {};

// UI components
COMPONENTATOR('ui', 'exec,locale,aselected,page,viewbox,input,importer,box,cloudeditorsimple,validate,loading,intranetcss,notify,message,errorhandler,empty,menu,colorpicker,icons,miniform,clipboard,approve,columns,iframepreview,search,searchinput,fileuploader,formdata,filesaver,filereader,ready,datagrid,configuration,markdown,markdownpreview,tangular-color', true);

// Permissions
ON('ready', function() {
	for (var key in F.plugins) {
		var item = F.plugins[key];
		if (item.permissions)
			OpenPlatform.permissions.push.apply(OpenPlatform.permissions, item.permissions);
	}
});

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