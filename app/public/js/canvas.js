document.addEventListener("DOMContentLoaded", function() {
   var mouse = {
      click: false,
      move: false,
      pos: {x:0, y:0},
      pos_prev: false
   };
   // get canvas element and create context
   var canvas  = document.getElementById('drawing');
   var context = canvas.getContext('2d');
   var width   = window.innerWidth;
   var height  = window.innerHeight;
   var enabled = true;

   var socket  = GameSocket;

   // set canvas to full browser width/height
   canvas.width = 650;//width;
   canvas.height = 500;//height;

   // register mouse event handlers
   canvas.onmousedown = function(e){ mouse.click = true; };
   canvas.onmouseup = function(e){ mouse.click = false; };

   canvas.onmousemove = function(e) {
     var rect = canvas.getBoundingClientRect();
      // normalize mouse position to range 0.0 - 1.0
      mouse.pos.x = (e.clientX - rect.left) / width;
      mouse.pos.y = (e.clientY - rect.top) / height;
      mouse.move = true;
   };

   /*socket.on(protocol.CLIENT.update_game_list, function(data){
      alert(JSON.stringify(data));
   });
   socket.on(protocol.CLIENT.error, function(data){
      alert(JSON.stringify(data));
   });

   socket.emit(protocol.SERVER.new_game, { name: "test_game"});
   */

    var drawLine = function(line){
        context.beginPath();
        context.moveTo(line[0].x * width, line[0].y * height);
        context.lineTo(line[1].x * width, line[1].y * height);
        context.stroke();
    }


   // draw line received from server
	socket.on(protocol.ALL.canvas_update, function (data) {
        for(var i in data.lines){
            drawLine(data.lines[i]);
        }
   });

   socket.on(protocol.CLIENT.reset_canvas, function (data) {
        context.clearRect(0, 0, canvas.width, canvas.height);
   });
   
   socket.on(protocol.CLIENT.update_turn, function (data) {
        var usrname = document.getElementById("usrname").innerHTML;
        if(data.turn == usrname){
            enabled = true;
        }else{
            enabled = false;
        }
   });
   
   socket.on(protocol.CLIENT.update_session, function(data){
        if(data.name == "lobby" ){
            enabled = true;
        }
   });
   


   // main loop, running every 25ms
   function mainLoop() {
      // check if the user is drawing
      if (mouse.click && mouse.move && mouse.pos_prev && enabled) {
         // send line to to the server
         
         var line = [ mouse.pos, mouse.pos_prev ];
         drawLine(line);
         socket.emit(protocol.ALL.canvas_update, { lines: [line]});
         mouse.move = false;
      }
      mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
      setTimeout(mainLoop, 15);
   }
   mainLoop();
});
