(function(exports){
    exports.ALL = {
        chat_message: "chat_message",
        canvas_update: "canvas_update",
    }

    exports.SERVER = {
        set_answer: "set_answer",
        new_game: "new_game",
        join_game: "join_game",
        leave_game: "leave_game",
        update_game_list: "update_game_list",
        get_game_list: "get_game_list",
        get_profile: "get_profile",
        guess: "guess",
		    set_next_turn:"set_next_turn"
    };

    exports.CLIENT = {
		get_count_time:"get_count_time",
        update_profile: "update_profile",
        update_game_list: "update_game_list",
        update_turn: "update_turn",
        game_stopped: "game_stopped",
        update_hidden_answer: "update_hidden_answer",
        update_guesses: "update_guesses",
        error: "server_error",
        update_session: "update_session",
        reset_canvas: "reset_canvas"

    };

})(typeof exports === 'undefined'? this.protocol ={}: exports);
