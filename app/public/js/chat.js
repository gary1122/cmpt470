var d;
var n;
$('#chat-btn').attr('disabled',true);

$(function () {
$('#chat-btn').attr('disabled',true);
    var socket = GameSocket;
    $('#chat-form').submit(function(){
      socket.emit(protocol.ALL.chat_message, $('#m').val());
      $('#m').val('');
     $('#chat-btn').attr('disabled',true);
      return false;
    });

  $('#m').keyup(function(){
	if($(this).val().length>0){
		$('#chat-btn').attr('disabled',false);
	}else{
		$('#chat-btn').attr('disabled',true);}

	});



    socket.on(protocol.ALL.chat_message, function(msg){
	d = new Date();
	n = d.toLocaleTimeString();
      $('#messages').append($('<li>').text(n+" " + msg));
	$("#textArea").scrollTop($("#textArea")[0].scrollHeight);

    });
  });
