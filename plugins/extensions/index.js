exports.icon = 'ti ti-layer-plus';
exports.name = '@(Extensions)';
exports.position = 1;
exports.permissions = [{ id: 'extensions', name: 'Extensions' }];
exports.visible = user => user.sa || user.permissions.includes('extensions');

exports.install = function() {

	// Profiles
	ROUTE('+API    /api/    -extensions                     *Extensions          --> list');
	ROUTE('+API    /api/    -extensions_read/{id}           *Extensions          --> read');
	ROUTE('+API    /api/    +extensions_save                *Extensions          --> save');
	ROUTE('+API    /api/    -extensions_remove/{id}         *Extensions          --> remove');
	ROUTE('+API    /api/    -extensions_download/{id}       *Extensions          --> download');
	ROUTE('+API    /api/    -extensions_readme/{id}         *Extensions          --> readme');
	ROUTE('+API    /api/    -extensions_config_read/{id}    *Extensions/Config   --> read');
	ROUTE('+API    /api/    +extensions_config_save         *Extensions/Config   --> save');
	ROUTE('+API    /api/    -extensions_logs                *Extensions          --> logs');
	ROUTE('+API    /api/    -extensions_sessions            *Extensions          --> sessions');

};