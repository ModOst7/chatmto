var app = app || {};

app.Message = Backbone.Model.extend({
	initialize: function() {
		//this.id = this.cid
	},
	idAttribute: '_id',
	defaults: {
		messages: [],
		url: '/api/chat',
		name: 'default',
		sessionId: '',
		connect: 'online'
	},
	toggle: function() {
		this.save({
			completed: !this.get('completed')
		});
	}
});
