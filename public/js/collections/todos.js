var app = app || {};
var MessageList = Backbone.Collection.extend({
	model: app.Message,
	url: '/api/chats'
	//localStorage: new Backbone.LocalStorage('todos-backbone')
});
