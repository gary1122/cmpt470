
$(function() {
    $('#new-game-btn').attr('disabled',true);
    var socket = GameSocket;


    $('#new-game-form').submit(function(){
         var name = $('#newGame').val();
         socket.emit(protocol.SERVER.new_game, {name: name});
        //document.getElementById("session-name").innerHTML = name + " Game Room";
        $('#newGame').val("");
         return false;
    });


    $('#newGame').keyup(function(){
    if($(this).val().length>0){
      $('#new-game-btn').attr('disabled',false);
    }else{
      $('#new-game-btn').attr('disabled',true);}
    });

    $('#join-game-btn').attr('disabled',true);

    $('#join-game-form').submit(function(){
         var name = $('#joinGame').val();
         socket.emit(protocol.SERVER.join_game, {name: name});
         //document.getElementById("session-name").innerHTML = name + " Game Room";
         return false;
    });

    $('#joinGame').keyup(function(){
    if($(this).val().length>0){
      $('#join-game-btn').attr('disabled',false);
    }else{
      $('#join-game-btn').attr('disabled',true);}

    });
    socket.on(protocol.SERVER.new_game, function(data){
        $('#set-answer-form').hide();
        $('#guess-anser-form').hide();
        $('#answer-holder').hide();
        $('#status').hide();
    });

    socket.on(protocol.CLIENT.update_session, function(data){
        //alert(JSON.stringify(data));
        if(data.name == "lobby" ){
          document.getElementById("session-name").innerHTML = "The Game Lobby";
          $('#set-answer-form').hide();
          $('#guess-anser-form').hide();
          $('#answer-holder').hide();
          $('#status').hide();
          $('#lobby-show').show();
        }else{
          $('#lobby-show').hide();
          document.getElementById("session-name").innerHTML = data.name + " Game Room";
        }
    });


    $('#gamelist-btn').on('click', function(){
        socket.emit(protocol.SERVER.get_game_list, {});
    });

    /*$('#resetcanvas').on('click', function(){
        socket.emit(protocol.CLIENT.reset_canvas, {});
    });*/

    socket.on(protocol.CLIENT.update_game_list, function(data){

	      $('#gamelist').empty();
	       for(var i in data.games){
           var gamename = data.games[i].name;
           var text = data.games[i].numPlayers + " players playing in " + data.games[i].name;

	          $('#gamelist').append($('<tr>')).append($('<td>').text(text)).append($('<button>Join</button>').attr('id', 'insert'+i));

	       }
         for(var j in data.games){
           (function(j){
             $('#insert' + j).click(function(){
               var gamename = data.games[j].name;
               socket.emit(protocol.SERVER.join_game, {name: gamename});
             });
           })(j);
         }

    });

    socket.on(protocol.CLIENT.update_turn, function(data){
     // alert(JSON.stringify(data));
        //alert(JSON.stringify(data));
        var usrname = document.getElementById("usrname").innerHTML;
	alert ( " next turn is: " + data.turn );
        $('#turn').text(data.turn);
        $('#status').show();
        if(data.turn == usrname){
            $('#set-answer-form').show();
            $('#guess-anser-form').hide();
        }else{
          $('#guess-anser-form').show();
          $('#set-answer-form').hide();
        }

    });
	socket.on(protocol.CLIENT.get_count_time, function(data){
        document.getElementById("clock").innerHTML =  data.time + "s ";
    });
    socket.on(protocol.CLIENT.update_hidden_answer, function(data){
        alert("The blurred answer is: " + JSON.stringify(data));
    });

    socket.on(protocol.CLIENT.update_guesses, function(data){
		var usrname = document.getElementById("usrname").innerHTML;
        if ( data.correct){
			alert(data.usrname + " has correct guess, " + data.guess + "  " );
		} else if (data.usrname ==  usrname ){
			alert("Your guess is incorrect ");
		} else {
			//
		}
    });

	socket.on(protocol.CLIENT.update_profile, function(profile){
        alert(JSON.stringify("score changed" + profile.score));
	      $('#score').text(profile.score);
    });


    $('#set-answer-form').submit(function(){
         var text = $('#setAnswer').val();
         alert("set answer:" + text);
         socket.emit(protocol.SERVER.set_answer, text);
         return false;
    });

    $('#setAnswer').keyup(function(){
    if($(this).val().length>0){
      $('#set-answer-btn').attr('disabled',false);
    }else{
      $('#set-answer-btn').attr('disabled',true);}
    });


    $('#guess-anser-form').submit(function(){
         var text = $('#guessAnser').val();
         socket.emit(protocol.SERVER.guess, text);
         return false;
    });

    $('#guessAnser').keyup(function(){
    if($(this).val().length>0){
      $('#guess-answer-btn').attr('disabled',false);
    }else{
      $('#guess-answer-btn').attr('disabled',true);}
    });

});
