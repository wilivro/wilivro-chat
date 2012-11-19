var app = require('express').createServer()
var io = require('socket.io').listen(app);

app.listen(8080);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// routing
app.get('/jquery.js', function (req, res) {
  res.sendfile(__dirname + '/jquery.js');
});

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = ['WiLivro','Alunos','Instrutores'];

Array.prototype.unique=function(a){
  return function(){return this.filter(a)}}(function(a,b,c){return c.indexOf(a,b+1)<0
});

io.sockets.on('connection', function (socket) {
	
	
	socket.on('adduser', function(username){
		// store the username in the socket session for this client
		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = 'WiLivro';
		// add the client's username to the global list
		usernames[username] = username;
		// send client to room 1
		socket.join('WiLivro');
		// echo to client they've connected
		socket.emit('updatechat', '#', 'Bem vindo ao chat');
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to('WiLivro').emit('updatechat', '#', username+' entrou na sala.');
		socket.emit('updaterooms', rooms, 'WiLivro');
	});

	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});
	
	socket.on('switchRoom', function(newroom){

		
		rooms.push(newroom);
		rooms = rooms.unique();

		socket.leave(socket.room);
		socket.join(newroom);

		socket.emit('updatechat', '#', 'Você foi conectado à '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', '#', socket.username+' saiu da sala.');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', '#', socket.username+' entrou na sala.');
		
		io.sockets.emit('updaterooms', rooms, newroom);
	});
	

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remover o usuário da lista de usuários
		delete usernames[socket.username];
		// Atualizar a lista de usuários ativos no chat
		io.sockets.emit('updateusers', usernames);
		// mostrar mensagem de desconectado
		if (socket.username)
		{
			socket.broadcast.emit('updatechat', '#', socket.username + ' foi desconectado.');	
		}
		socket.leave(socket.room);
	});
});
