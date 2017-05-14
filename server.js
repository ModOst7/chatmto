
var application_root = __dirname,
    express = require( 'express' ), //Web framework
    path = require( 'path' ), //Utilities for dealing with file paths
    http = require('http'),
    mongoose = require( 'mongoose' ), //MongoDB integration
    uri = 'mongodb://potsyk:duhastduhastxd@ds021326.mlab.com:21326/messages_database',
    cookieParser = require('cookie-parser'),
    sessionstore = require('sessionstore');
    //redis = require('redis'),
    //RedisStore = require('connect-redis')(express),
    //rClient = redis.createClient(),
    //sessionStore = new RedisStore({client:rClient});

var app = express(),
server = http.createServer(app);
mongoose.connect(uri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var Message = new mongoose.Schema({
   author: String,
   message: String,
   releaseDate: Date
});
var MessageModel = mongoose.model('Message', Message);
//==========
var Chat = new mongoose.Schema({
  messages: Array,
  name: String,
  sessionId: String,
  connect: String
});
var ChatModel = mongoose.model('Chat', Chat);
//==========


app.configure( function() {
    app.use( express.bodyParser() );
    app.use( express.methodOverride() );
    app.use( app.router );
    app.use( express.static( path.join( application_root, 'public') ) );
    app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(cookieParser);
    app.use(express.session({store:sessionstore.createSessionStore(), key:'jsessionid', secret:'your secret here'}));
});
var port = process.env.PORT || 3000;
server.listen(port, function() {
   console.log('listen on port %d in %s mode %b', port, app.settings.env, 'kek', process.env.VCAP_SERVICES);
})



var io = require('socket.io')(server);
//io.set('log level', 1);
//io.set("transports", ["websocket"]);
 
var create = function (socket, data) {
    var e = event('create', data.signature);
    var chat = new ChatModel({
    messages: [],
    name: data.item.name,
    sessionId: data.item.sessionId
  });
  chat.save(function(err) {
    if (!err) {
      return console.log('created chat')
    } else {
      console.log(err)
    }
  })
    socket.emit(e, chat);
    if (adminId) io.sockets.sockets[adminId].emit('newConnect')            
};
 
var read = function (socket, signature) {
    var e = event('read', signature), data=[];

    ChatModel.find({}, function(err, data) {
      if (err != null) {
        console.log('error!!!');
        return
      }
      socket.emit(e, data)
    })
    data.push({})
    //socket.emit(e, data);            
};
 
var update = function (socket, data) {
    var e = event('update', data.signature); //data = [];
    ChatModel.find({"_id": data.signature.id}, function(err, datta) {
      if (err != null) {
        console.log('ошибка');
        return;
      }
      datta[0].messages.push(data.item.messages[data.item.messages.length-1]);
      datta[0].save(function(err) {
        if (err) console.log(err)
      })
      //datta[0].attributes.messages = data.item.messages;
    })
    socket.emit(e, {success : true});            
};
 
var destroy = function (socket, signature) {
    var e = event('delete', signature), data = [];
    socket.emit(e, {success : true});            
};
 
// creates the event to push to listening clients
var event = function (operation, sig) {
    var e = operation + ':'; 
    e += sig.endPoint;
    if (sig.ctx) e += (':' + sig.ctx);
 
    return e;
};
 
var adminId = '';
io.sockets.on('connection', function (socket) {
    console.log(io.sockets/*.namespace.manager.rooms*/);
    socket.on('create', function (data) {
        create(socket, data);       
    });      
    socket.on('read', function (data) {
        read(socket, data.signature);
    });  
    socket.on('update', function (data) {
        update(socket, data);       
    }); 
    socket.on('delete', function (data) {
        destroy(socket, data.signature);       
    }); 
    socket.on('message', function(message) {
        if (adminId) io.sockets.sockets[adminId].emit('sendMessage', message)  
      })
    socket.on('disconnect', function() {
      if (socket.id != adminId) {
        ChatModel.find({"sessionId": socket.id}, function(err, data) {
          if (err != null) {
            console.log('ошибка');
            return
          }
          console.log('disc!!!');
          console.log(socket.id);
          if (!data[0]) return;
          data[0].connect = 'offline';
          data[0].save(function(err) {
            if (err) {
              console.log(err);
              return;
            }
            if (adminId) io.sockets.sockets[adminId].emit('userOffline', {"modelId": data[0]._id})
          })
        })
      }
    })
    
    socket.on('batyaOnline', function() {
      adminId = socket.id;
      socket.broadcast.emit('batyaStatus', {'online': true});
      socket.on('delChat', function(model) {
        ChatModel.find({"_id": model.modelId}, function(err, data) {
          if (err != null) {
            console.log('err');
            return
          }
          data[0].remove(function(err) {
            if (err) {
              console.log('err del');
              return
            }
          })
        })
      })
      //console.log(io.sockets.sockets[adminId])
      socket.on('disconnect', function() {
        if (socket.id == adminId) {
        adminId = '';
        socket.broadcast.emit('batyaStatus', {'online': false});
      }
        console.log('kek  ' + io.sockets)
      })
    })

    if (adminId && socket != adminId) {
      socket.emit('batyaStatus', {'online': true}) 
    } else if (!adminId && socket != adminId) {
      socket.emit('batyaStatus', {'online': false});
    }
    socket.on('sendToUser', function(data) {
      console.log("KEK");
      console.log(data.sessionId);
      console.log(io.sockets.sockets);
      io.sockets.sockets[data.sessionId].emit('messageToUser', data)
      console.log(data)
    })               
});

