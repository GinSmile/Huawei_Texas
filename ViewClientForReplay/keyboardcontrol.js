        var socket_of_play;
        var has_manual_player = false;
        var manual_player_id = -1;
        var manual_player_seat = null;
        var raise_num = 0;
        
        function is_manual_player(seat)
        {
            return (players_on_seat[seat].id == manual_player_id);
        }        
        
        function get_manual_player_jetton()
        {
            return parseInt(players_on_seat[manual_player_seat].jetton);            
        }
        
        function get_manual_player_bet()
        {
            return parseInt(players_on_seat[manual_player_seat].bet);
        }
        
        
        function DisableAllButtons() {
            document.getElementById("check_b").disabled=true;
            document.getElementById("call_b").disabled=true;
            document.getElementById("raise_b").disabled=true;
            document.getElementById("allin_b").disabled=true;
            document.getElementById("fold_b").disabled=true;  
            document.getElementById('raise_extend').innerHTML = "";            
        }       
                
        function EnableButton(button_name) {
            document.getElementById(button_name).disabled=false;        
        }
        
        
        function CheckOnclick() {
            socket_of_play.send("check \n");  
            DisableAllButtons();         
        }
        
        function CallOnclick() {
            socket_of_play.send("call \n");      
            DisableAllButtons();      
        }        
        
        function RaiseOnclick() {
            var action_str = "raise "+document.getElementById("raise_input").value+"\n";
            socket_of_play.send(action_str);
            DisableAllButtons();
        }
        
        function AllInOnclick() {
            socket_of_play.send("all_in \n");
            DisableAllButtons();
        }
        
        function FoldOnclick() {
            socket_of_play.send("fold \n");
            DisableAllButtons(); 
        }             
        
        function GetActionInquireMsg(message_data) { 
            EnableButton("fold_b");          
            EnableButton("allin_b");
            if(current_bet == get_manual_player_bet())
            {
                EnableButton("check_b");            
            }
            else if( current_bet - get_manual_player_bet() < get_manual_player_jetton() )
            {
                EnableButton("call_b");            
            }   
            
            if( minimum_raise + current_bet - get_manual_player_bet() < get_manual_player_jetton() )
	    {
	        EnableButton("raise_b");
	        var html_str = ' 加注额 <input type = "text" id="raise_input" value=' + minimum_raise.toString() + '>';
	        document.getElementById('raise_extend').innerHTML += html_str;                           
	    }
        }
                        
        function CreateKeyboardControl() {        
            document.getElementById('keyboard_control').innerHTML = 
                '<button type="button" id = "check_b" onclick = "CheckOnclick()">让牌</button> ' +
                '<button type="button" id = "call_b" onclick = "CallOnclick()">跟注</button> ' +
                '<button type="button" id = "raise_b" onclick = "RaiseOnclick()">加注</button> '+
                '<button type="button" id = "allin_b" onclick = "AllInOnclick()">全押</button> '+
                '<button type="button" id = "fold_b" onclick = "FoldOnclick()">弃牌</button>';
        }              
        
        function init_player_socket() {
	    with(document.getElementById('log'))
	    {
	        socket_of_play = new WebSocket('ws://127.0.0.1:8765');
	        socket_of_play.onopen = function (evt) {
	            innerHTML += '<p> connect to player ok';
	            has_manual_player = true;
	            CreateKeyboardControl();
	            DisableAllButtons();
	        }
	            
	        socket_of_play.onclose = function (evt) {
	            //innerHTML += '<p> player disconnected';	            
	        }
	            
	        socket_of_play.onerror = function (evt) {
	            //innerHTML += '<p> player socket error: ' + evt.data;
	        }
	            
	        socket_of_play.onmessage = function (message) {
	            GetActionInquireMsg(message.data);
	            //innerHTML = message.data;
	        }
	    }	    
        }         