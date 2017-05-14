var app = app || {};
app.AppView = Backbone.View.extend({
	tagName: 'div',
	id: '#window-chat',
	statsTemplate: _.template($('#item-template').html()),
	events: {
		'keypress #message': 'sendMessage'
	},
	initialize: function() {
		this.sendMessage = _.bind(this.sendMessage, this);
		this.$('#container').empty();
		console.log("OLOLOLO");
		if (this.model.attributes.connect == 'offline') {
			$('#message').attr({'disabled': 'true'});
			$('#put').attr({'disabled': 'true'})
		} else {
			$('#message').removeAttr('disabled');
			$('#put').removeAttr('disabled')
		}
		for(var i=0; i<this.model.attributes.messages.length; i++) {
			this.$el.append(this.statsTemplate(this.model.attributes.messages[i]))
		}
		this.$el.prependTo('#container')
		this.listenTo(this.model, 'change', this.render);
	},
	render: function(model) {
		if (model.changed.connect) return;
		//model.sync('update', model);
		var lengthChat = model.attributes.messages.length;
		this.$el.append(this.statsTemplate(model.attributes.messages[lengthChat-1]))
	},
	sendMessage: function(event) {
		if (!$('#message').val()) return;
		console.log(event)
		if (event.type == "keypress" && event.keyCode !== 13) return;
		var message = {},
		sessionId = this.model.attributes.sessionId;
		message.releaseDate = new Date().getTime();
		//this.$name = $('#name');
		message.author = 'admin';//$('#name').val();
		//this.$message = $('#message');
		message.message = divEscapedContentElement($('#message').val());
		this.model.attributes.messages.push(message);
		this.model.sync('update', this.model);
		this.model.trigger('change', this.model);
		message.message = rc4(this.model.attributes.sessionId, message.message);
		socket.emit('sendToUser', {message: message, sessionId: sessionId});
		message.message = divEscapedContentElement($('#message').val());
		$('#message').val('');
		return;
		//event.originalEvent.preventDefault();
		console.log(this.model.attributes.sessionId);
		
	}
});
//===========================================================================================

app.AppUsers = Backbone.View.extend({
	el: '#admin-window',
	events: {
		'click li': 'showChat'
	},
	statsTemplate: _.template($('#users-template').html()),
	initialize: function() {
		socket.emit('batyaOnline');
		app.Dialog = new MessageList();
		this.listenTo(app.Dialog, 'add', this.render);
		app.Dialog.fetch();
		socket.on('sendMessage', _.bind(function(message) {
			var chat = app.Dialog.findWhere({_id: message.id});
			message.message.message = rc4(chat.attributes.sessionId, message.message.message);
			chat.attributes.messages.push(message.message);
			if (this.chatView && this.chatView.model.id == message.id) {
				console.log('KEK');
				this.chatView.render(this.chatView.model)
			}
			console.log('KEK');
			console.log(this.chatView)
	},this))
		socket.on('userOffline', function(model) {
			$('#users li[data-id=' + model.modelId + ']').removeClass('online').addClass('offline');      //model.modelId
			$('#message').attr({'disabled': 'true'});
			$('#put').attr({'disabled': 'true'});
			app.Dialog.fetch()
			//$('')
		})
	},
	render: function(model) {
		this.$('#users ul').append(this.statsTemplate(model.attributes));
	},
	showChat: function(e) {
		if (this.chatView) {
			this.chatView.remove();
			$('#put').off('click', this.chatView.sendMessage);
			$('#message').off('keypress', this.chatView.sendMessage)
		}
		var chat = app.Dialog.findWhere({_id: e.target.dataset.id});
		this.chatView = new app.AppView({model: chat});
		$('#put').on('click', this.chatView.sendMessage);
		$('#message').on('keypress', this.chatView.sendMessage)
	}
})


$(document).ready(function() {
	$('#message').attr({'disabled': 'true'});
	$('#put').attr({'disabled': 'true'});
	var pek = new app.AppUsers();
	socket.on('newConnect', function() {
		app.Dialog.fetch()
	})

	document.querySelector('#users').addEventListener('click', function(e) {
		if (e.target.tagName == 'SPAN') { 
			var modelId = $(e.target).parent().attr('data-id');
			socket.emit('delChat', {"modelId": modelId});
			$(e.target).parent().remove();
			e.stopPropagation();
			e.preventDefault();
		}
	}, false)

	
})