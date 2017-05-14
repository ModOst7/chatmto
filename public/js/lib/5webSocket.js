//var socket = io.connect('http://karasique228-1488.cfapps.io');
/*var host = window.location.host.split(':')[0];
console.log('PORT:');
console.log(window.location.host.split(':')[1]);
var socket = io('http://' + host);*/
//var socket = io();
var socket = new io();

Backbone.sync = function (method, model, options) {
    var socket = window.socket; // grab active socket from global namespace; io.connect() was used to create socket
 
    /*
     * Create signature object that will emitted to server with every request. 
     * This is used on the server to push an event back to the client listener.
     */
    var signature = function () {
        var sig = {};    
         
        sig.endPoint = model.url + (model.id ? ('/' + model.id) : '');
        if (model.ctx) sig.ctx = model.ctx;
        console.log('modelID')
        console.log(model)
        sig.id = model.id;
        return sig;
    };
     
    /*
     * Create an event listener for server push. The server notifies
     * the client upon success of CRUD operation.
     */
    var event = function (operation, sig) {
        var e = operation + ':'; 
        e += sig.endPoint;
        if (sig.ctx) e += (':' + sig.ctx);
 
        return e;
    };
     
    // Save a new model to the server.
    var create = function () {  
        var sign = signature(model); 
        var e = event('create', sign);
        socket.emit('create', {'signature' : sign, item : model.attributes }); 
        socket.once(e, function (data) {
            model.id = data._id;  
            console.log('created:');
            console.log(model);                     
        });                           
    };              
 
    // Get a collection or model from the server.
    var read = function () {
        console.log('reading');
        console.log(model)
        var sign = signature(model);
        var e = event('read', sign);
        socket.emit('read', {'signature' : sign});  
        socket.once(e, function (data) {
            console.log(data);
            console.log(e)
            options.success(data); // updates collection, model; fetch                      
        });   
    }; 
     
    // Save an existing model to the server.
    var update = function () {
        console.log('update');
        var sign = signature(model); // url api/chat/sdfdsf45sdf4sdf4
        var e = event('update', sign);
        socket.emit('update', {'signature' : sign, item : model.attributes }); // model.attribues is the model data
        socket.once(e, function (data) { 
            console.log('updated:');
            console.log(data);                     
        });                           
    };  
     
    // Delete a model on the server.
    var destroy = function () {
        var sign = signature(model); 
        var e = event('delete', sign);
        socket.emit('delete', {'signature' : sign, item : model.attributes }); // model.attribues is the model data
        socket.once(e, function (data) { 
            console.log('destroyed:');
            console.log(data);                     
        });                           
    };             
       
    // entry point for method
    switch (method) {
        case 'create':
            create();
            break;        
        case 'read':  
            read(); 
            break;  
        case 'update':
            update();
            break;
        case 'delete':
            destroy();
            break; 
    }        
};