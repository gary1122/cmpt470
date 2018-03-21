var express = require('express');
var Authenticator = require('./Authenticator');
var GameSession = require('./GameSession');
var Protocol = require('../public/js/protocol.js');

var GameRouter = class {
    constructor(dbManager, sockets){
        this.dbManager = dbManager;
        this.router = express.Router();
        this.connections = {};
        this.gameSessions = {
            lobby: new GameSession.LobbySession("lobby")
        };

        var router = this;

        var getGameList = function(){
            var list = [];
            for (var name in router.gameSessions) {
                var session = router.gameSessions[name];
                var desc = {
                    name: name,
                    numPlayers: session.getNumPlayers()
                };
                list.push(desc);
            }
            return list;
        };

        var updateGameList = function(){
            var list = getGameList();
            for(var i in router.gameSessions){
                router.gameSessions[i].broadcastData(Protocol.CLIENT.update_game_list, {games: list}, router.connections);
            }
        }

        var updateCurrentSession = function(usrname, connections){
            if(!(usrname in router.connections)){
                return;
            }
            var connection = router.connections[usrname];
            connection.socket.emit(Protocol.CLIENT.update_session, {
                name: connection.session.getName(),
                numPlayers: connection.session.getNumPlayers()
            });
        }

        var removeSessionIfEmpty = function(session){
            if(session.getNumPlayers() == 0 && session != router.gameSessions.lobby){
                delete router.gameSessions[session.getName()];

            }
        };


        this.router.get('/draw', Authenticator.isLoggedIn, function(req, res) {
            res.render('draw', {
               title: 'Drawing Canvas',
               username: req.session.usrname
            });
        });

        this.router.get('/mainpage', Authenticator.isLoggedIn, function(req, res) {
            res.render('mainpage', {
               title: 'Draw page',
               username: req.session.usrname
            });
        });

        sockets.on('connection', function(socket){
            console.log("Attempted connection");
            if(!Authenticator.authSocket(socket)){
                console.log("Unrecongnized user, disconnecting...");
                socket.disconnect();
                return;
            }

            var usrname = socket.request.session.usrname;
            console.log(usrname + " connected!");

            dbManager.loadPlayerProfile(usrname, function(profile){
                router.connections[usrname] = {
                    socket: socket,
                    profile: profile,
                    session: null
                };
                router.gameSessions.lobby.join(usrname, router.connections);
                updateGameList();
                updateCurrentSession(usrname, router.connections);
                console.log("SESSIONS: " + JSON.stringify(router.gameSessions));
            });

            socket.on('disconnect', function() {
                var usrname = socket.request.session.usrname;
                if(!(usrname in router.connections)){
                    return;
                }
                var connection = router.connections[usrname];
                dbManager.savePlayerProfile(connection.profile, function(){
                    var currSession = router.connections[usrname].session;
                    currSession.leave(usrname, router.connections);
                    removeSessionIfEmpty(currSession);
                    updateGameList();

                    console.log("SESSIONS: " + JSON.stringify(router.gameSessions));
                    delete router.connections[usrname];
                    console.log(usrname + ' disconnected');
                });
            });

            socket.on(Protocol.ALL.chat_message, function(msg){
                if(msg=='')
                {
                    return false;
                }

                var usrname = socket.request.session.usrname;
                console.log("Message from " + usrname + ": "+ msg)
                router.connections[usrname].session.broadcastMessage(usrname, msg, router.connections);
            });

            socket.on(Protocol.SERVER.new_game, function(data){
                var name = data.name;
                if(!name || (name in router.gameSessions)){
                    socket.emit(Protocol.CLIENT.error, {message: "Unable to start game. A game with the name "+ name +" already exists"});
                    return;
                }
                var newSession = new GameSession.GameSession(name);
                router.gameSessions[name] = newSession;

                var usrname = socket.request.session.usrname;
                var currSession = router.connections[usrname].session;
                currSession.leave(usrname, router.connections);
                removeSessionIfEmpty(currSession);

                newSession.join(usrname, router.connections);

                updateGameList();
                updateCurrentSession(usrname, router.connections);

                console.log("New game started: " + name);
                console.log("SESSIONS: " + JSON.stringify(router.gameSessions));
            });

            socket.on(Protocol.SERVER.join_game, function(data){
                var name = data.name;
                console.log("Attmepting to join game: " + name);
                if(!name || !(name in router.gameSessions)){
                    socket.emit(Protocol.CLIENT.error, {message: "Unable to join game. A game with the name "+ name +" does not exist"});

                    return;
                }

                var usrname = socket.request.session.usrname;
                var currSession = router.connections[usrname].session;
                var nextSession = router.gameSessions[name];

                if(currSession.getName() == nextSession.getName()){
                    socket.emit(Protocol.CLIENT.error, {message: "You are already in game " + name});
                    return;
                }
                currSession.leave(usrname, router.connections);
                removeSessionIfEmpty(currSession);
                nextSession.join(usrname, router.connections);
                updateGameList();
                updateCurrentSession(usrname, router.connections);

                console.log("Player " + usrname + " joined " + name);
            });

            socket.on(Protocol.SERVER.leave_game, function(data){
                var usrname = socket.request.session.usrname;
                var currSession = router.connections[usrname].session;
                if(!currSession){
                    return;
                }

                currSession.leave(usrname, router.connections);
                removeSessionIfEmpty(currSession);
                if(currSession != router.gameSessions.lobby){
                    router.gameSessions.lobby.join(usrname, router.connections);
                }
                updateGameList();
                updateCurrentSession(usrname, router.connections);
            });

            socket.on(Protocol.ALL.canvas_update, function(data){
                var usrname = socket.request.session.usrname;
                var currSession = router.connections[usrname].session;
                if(!currSession){
                    return;
                }

                currSession.broadcastCanvasUpdate(usrname, data, router.connections);
            });

            socket.on(Protocol.SERVER.set_answer, function(data){
                var usrname = socket.request.session.usrname;
                var currSession = router.connections[usrname].session;
                if(!currSession){
                    return;
                }

                currSession.setAnswer(usrname, data, router.connections);
            });
			         /*socket.on(Protocol.SERVER.set_next_turn, function(data){
                var usrname = socket.request.session.usrname;
                var currSession = router.connections[usrname].session;
                if(!currSession){
                    return;
                }

                currSession.setNextTurn(router.connections);
            });*/
            socket.on(Protocol.SERVER.guess, function(data){
                var usrname = socket.request.session.usrname;
                var currSession = router.connections[usrname].session;
                if(!currSession){
                    return;
                }

                currSession.guess(usrname, data, router.connections);
            });

            socket.on(Protocol.SERVER.get_game_list, function(data){
                var list = getGameList();
                socket.emit(Protocol.CLIENT.update_game_list, {games: list});
            });

            socket.on(Protocol.SERVER.get_profile, function(data){
                var usrname = socket.request.session.usrname;
                var connection = router.connections[usrname];
                socket.emit(Protocol.CLIENT.update_profile, connection.profile);
            });
        });
    }
}

module.exports = GameRouter;
