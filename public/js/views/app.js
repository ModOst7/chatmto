var app = app || {};
app.AppView = Backbone.View.extend({
	el: '#main',
	statsTemplate: _.template($('#item-template').html()),
	events: {
		'click #put': 'sendMessage'
	},
	initialize: function(name) {
		console.log(socket)
   		this.name = name.username;
		app.Chat = new app.Message();
		app.Chat.set({name: this.name, sessionId: '/#' + socket.id/*socket.sessionid*/})
		this.listenTo(app.Chat, 'change', this.render);
		app.Chat.save();
		socket.on('messageToUser',  _.bind(function(data) {
			data.message.message = rc4('/#' + socket.id, data.message.message);
			this.$('#window-chat').append(this.statsTemplate(data.message))
			//app.Chat.sync('update', app.Chat)
		}, this))
		console.log('MODEL');
		console.log(app.Chat)
		//socket.emit('userConnected', {modelId:})
	},
	render: function(model) {
		var lengthChat = model.attributes.messages.length;
		this.$('#window-chat').append(this.statsTemplate(model.attributes.messages[lengthChat-1]))
	},
	sendMessage: function() {
		console.log('PUK');
		console.log(socket.id);
		if (!$('#message').val()) return;
		var message = {};
		message.releaseDate = new Date().getTime();
		message.author = this.name;//this.$('#name').val();
		message.message = divEscapedContentElement(this.$('#message').val());
		console.log('sdsdsdsdsdsd');
		console.log(message.message);
		app.Chat.attributes.messages.push(message);
		app.Chat.sync('update', app.Chat);
		app.Chat.trigger('change', app.Chat)
		message.message = rc4('/#' + socket.id, message.message);
		socket.emit('message', {message: message, id: app.Chat.id});//
		this.$('#message').val('');
		
	}
});

$(document).ready(function() {
	$('#intro button').on('click', function(event) {
		console.log($('#textName').val())
		if ($('#textName').val()) {
		var name = divEscapedContentElement($('#textName').val());
		var kek = new app.AppView({username: name});
		console.log('click')
		$('#intro').remove()
	} else return
	})

	$('#textName').on("keypress", function (event) {
		  		if (event.keyCode == 13 && $('#textName').val()) {
		  			var name = divEscapedContentElement($('#textName').val());
		  			var kek = new app.AppView({username: name});
		  			$('#intro').remove();
		  			event.preventDefault();
		  		};
		});
	
	socket.on('batyaStatus', function(status) {
	if (status.online) {
		$('.status img').attr({"src": "img/green_light.png"}).removeClass().addClass('green');
		$('.status span').text('Собеседник в сети')
		} else {
		$('.status img').attr({"src": "img/red_light.png"}).removeClass().addClass('red');
		$('.status span').text('Собеседник не в сети')
		}
})
})



