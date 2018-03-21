var Protocol = require('../public/js/protocol.js');

var LobbySession = class {
    constructor(name){
        this.name = name;
        this.players = [];
        this.canvas_history = [];
    }

    getNumPlayers() {
        return this.players.length;
    }

    getName(){
        return this.name;
    }

    join(usrname, connections){
        var connection = connections[usrname];
        connection.session = this;
        connection.socket.emit(Protocol.CLIENT.reset_canvas, {});

        this.players.push(usrname);
        this.broadcastServerMessage("User " + usrname + " is joining.", connections);
        connection.socket.emit(Protocol.ALL.canvas_update, {lines: this.canvas_history});
    }

    leave(usrname, connections){
        connections[usrname].session = null;
        connections[usrname].socket.emit(Protocol.CLIENT.reset_canvas, {});
        var i = this.players.indexOf(usrname);
        if (i > -1) {
            this.players.splice(i, 1);
            this.broadcastServerMessage("User " + usrname + " left.", connections);
        }
    }

    broadcastMessage(usrname, msg, connections){
        this.broadcastServerMessage(usrname + ": " + msg, connections);
    }

    broadcastServerMessage(msg, connections){
        this.broadcastData(Protocol.ALL.chat_message, msg, connections);
    }

    broadcastData(protocol, data, connections, sender){
        for(var i in this.players){
            var usrname = this.players[i];
            if(sender && sender == usrname){
                continue;
            }
            var connection = connections[usrname];
            connection.socket.emit(protocol, data);
        }
    }

    
    broadcastCanvasUpdate(){}
    startGame(){}
    stopGame(){}
    setAnswer(){}
    guess(){}
};


var GameSession = class extends LobbySession{
    constructor(name){
        super(name);
        this.started = false;
        this.turn = null;
        this.answer = null;
		this.timer = null;
    }

    join(usrname, connections){
        LobbySession.prototype.join.call(this, usrname, connections);
        if(this.getNumPlayers() > 1){
            this.startGame(connections);
        }
    }

    leave(usrname, connections){
        if(this.turn == usrname){
            this._nextTurn(connections);
        }

        LobbySession.prototype.leave.call(this, usrname, connections);

        if(this.getNumPlayers() < 2){
            this.stopGame(connections);
        }
    }
    
    broadcastCanvasUpdate(usrname, data, connections){
        if(this.started && this.turn == usrname){
            this.canvas_history.push.apply(this.canvas_history, data.lines);
            this.broadcastData(Protocol.ALL.canvas_update, data, connections/*, usrname*/);
        }
    }

    _nextTurn(connections){
        var i = 0;
        if(this.turn){
            var index = this.players.indexOf(this.turn);
            if(index > -1){
                i = index;
            }
            i++;
            if(i >= this.players.length){
                i = 0;
            }
        }

        var usrname = this.players[i];
        this.turn = usrname;
        this.answer = null;
        this.broadcastData(Protocol.CLIENT.reset_canvas, {}, connections);
        this.broadcastData(Protocol.CLIENT.update_turn, {turn: usrname}, connections);
		this.initCounter(connections);
    }

    startGame(connections){
        if(!this.started && this.getNumPlayers() > 1){
            console.log("Game started.");
            this.started = true;
            this._nextTurn(connections);
        }
    }

    stopGame(connections){
        if(this.started){
            console.log("Game stopped.");
            this.started = false;
            this.turn = null;
            this.answer = null;
			clearTimeout(this.timer);
			this.timer = null;
            this.broadcastData(Protocol.CLIENT.game_stopped, {}, connections);
        }
    }

    setAnswer(usrname, answer, connections){
        if(this.started && this.turn == usrname){
            this.answer = answer;
            var hiddenAnswer = answer.replace(/\S/gi, '#');
            this.broadcastData(Protocol.CLIENT.update_hidden_answer, hiddenAnswer, connections);
        }
    }
	setNextTurn(connections){
        this._nextTurn(connections);
    }
    guess(usrname, answer, connections){
        console.log('Attempting to guess');
        if(this.started && this.turn != usrname && this.answer){
            if(answer == this.answer){
                this.broadcastData(Protocol.CLIENT.update_guesses, {
                    usrname: usrname,
                    guess: answer,
                    correct: true
                }, connections);

                var profile = connections[usrname].profile;
                profile.score++;
                connections[usrname].socket.emit(Protocol.CLIENT.update_profile, profile);
				clearTimeout(this.timer);
                this._nextTurn(connections);
            } else {
				
                this.broadcastData(Protocol.CLIENT.update_guesses, {
                    usrname: usrname,
                    guess: answer,
                    correct: false
                }, connections);
            }
        }
    }
	turnCountDown(countDownDate,connections) {

		// Get todays date and time
		var now = new Date().getTime();
		// Find the distance between now an the count down date
		var distance = countDownDate - now;	
		// Time calculations for days, hours, minutes and seconds
		var seconds = Math.floor((distance % (1000 * 120)) / 1000);		
		if (distance < 0) { 
			clearTimeout(this.timer);
			this._nextTurn(connections);
		} else {
			this.broadcastData(Protocol.CLIENT.get_count_time, {time:seconds},connections);
			this.timer = setTimeout(() => { this.turnCountDown(countDownDate,connections); }, 1000);
		}
	}
	initCounter(connections){
		var countDownDate = new Date().getTime() + 120000;
		clearTimeout(this.timer);
		this.turnCountDown(countDownDate,connections);
	}
};

module.exports = {
    GameSession: GameSession,
    LobbySession: LobbySession
}
