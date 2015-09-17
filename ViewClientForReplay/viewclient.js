var socket_of_view;

var replay = null;
var game_id = null;
var button = 0;
var players_on_seat = [];
var players_on_board = [];
var current_seat = -1;

var pos_id = {};
var pos_id = {};
var pos_button = {};
var pos_holdcard0 = {};
var pos_holdcard1 = {};
var room_size = {};
var table_size = {};
var seat_canvas_size = {};
var jetton_canvas_size = {};
var action_canvas_size = {};
var pot_size = {};
var hold_card_size = 50;
var public_card_size = 80;
var bet_pos = [];
var pulic_card_pos = [];
var minimum_raise = 0;

var playback_msgs = [];
var playback_msg_index = 0;
var playback_speed_ms = 500;
var playback_status = 0;

var GAME_SERVER_MSG = 0;
var PLAY_BACK_MSG = 1;

function bet_pos_obj(x, y) {
	var bet_pos = {};
	bet_pos.x = x;
	bet_pos.y = y;
	return bet_pos;
}

function public_card_pos_obj(x, y) {
	var public_card = {};
	public_card.x = x;
	public_card.y = y;
	return public_card;
}

function init_pos() {
	seat_canvas_size.x = 100;
	seat_canvas_size.y = 145;

	jetton_canvas_size.x = 100;
	jetton_canvas_size.y = 30;

	action_canvas_size.x = 100;
	action_canvas_size.y = 30;

	room_size.x = 900;
	room_size.y = 605;

	table_size.x = 600;
	table_size.y = 300;

	pot_size.x = 200;
	pot_size.y = 30;

	pos_id.x = 15;
	pos_id.y = 15;

	pos_holdcard0.x = 10;
	pos_holdcard0.y = 30;
	pos_holdcard1.x = 50;
	pos_holdcard1.y = 30;

	pos_button.x = 80;
	pos_button.y = 138;

	bet_pos.push(bet_pos_obj(80, 15));
	bet_pos.push(bet_pos_obj(280, 15));
	bet_pos.push(bet_pos_obj(480, 15));
	bet_pos.push(bet_pos_obj(550, 150));
	bet_pos.push(bet_pos_obj(480, 295));
	bet_pos.push(bet_pos_obj(280, 295));
	bet_pos.push(bet_pos_obj(80, 295));
	bet_pos.push(bet_pos_obj(5, 150));

	pulic_card_pos.push(public_card_pos_obj(120, 100));
	pulic_card_pos.push(public_card_pos_obj(200, 100));
	pulic_card_pos.push(public_card_pos_obj(280, 100));
	pulic_card_pos.push(public_card_pos_obj(360, 100));
	pulic_card_pos.push(public_card_pos_obj(440, 100));
}

function audio_play(event) {
	document.getElementById(event).play();
}

function audio_player(action, seat) {
	if ((seat % 2) == 0) {
		document.getElementById(action + "_man").play();
	} else {
		document.getElementById(action + "_woman").play();
	}
}

function GetSeatCanvas(seat) {
	var canvas_id = "Seat" + seat;
	var seat_canvas = document.getElementById(canvas_id);
	var canvas_cxt = seat_canvas.getContext("2d");
	return canvas_cxt;
}

function GetJettonCanvas(seat) {
	var canvas_id = "Jetton" + seat;
	var jetton_canvas = document.getElementById(canvas_id);
	var canvas_cxt = jetton_canvas.getContext("2d");
	return canvas_cxt;
}

function GetActionCanvas(seat) {
	var canvas_id = "Action" + seat;
	var action_canvas = document.getElementById(canvas_id);
	var canvas_cxt = action_canvas.getContext("2d");
	return canvas_cxt;
}

function GetCanvas(id) {
	var action_canvas = document.getElementById(id);
	var canvas_cxt = action_canvas.getContext("2d");
	return canvas_cxt;
}

function HighlightPlayer(seat) {
	var seat_canvas = document.getElementById("Seat" + seat);
	seat_canvas.style.border = "3px solid #FFA500";
	current_seat = seat;
}

function NormalizeLastPlayer() {
	if (current_seat == -1) {
		return;
	}
	var seat_canvas = document.getElementById("Seat" + current_seat);
	seat_canvas.style.border = "1px solid #d3d3d3";
}

function DisplayPlayerOnBoard(seq, id, name, rank) {
	if (rank == 1) {
		document.getElementById("Player" + seq).innerHTML = "<font color='red' style='bold'>"
				+ id + "</font>";
		document.getElementById("Player" + seq + "Name").innerHTML = "<font color='red' style='bold'>"
				+ name + "</font>";
	} else {
		document.getElementById("Player" + seq).innerHTML = id;
        document.getElementById("Player" + seq + "Name").innerHTML = name;
	}
}

function DisplayScoreOnBoard(seq, hand, score, jetton, rank) {
	if (rank == 1) {
		document.getElementById("Hand" + seq).innerHTML = "<font color='red' style='bold'>"
				+ hand + "</font>";
		document.getElementById("Score" + seq).innerHTML = "<font color='red' style='bold'>"
				+ score + "</font>";
		document.getElementById("Jettons" + seq).innerHTML = "<font color='red' style='bold'>"
				+ jetton + "</font>";				
	} else {
		document.getElementById("Hand" + seq).innerHTML = hand;
		document.getElementById("Score" + seq).innerHTML = score;
		document.getElementById("Jettons" + seq).innerHTML = jetton;
	}
}

function DisplayButtonFlag(seat) {
	var canvas_cxt = GetSeatCanvas(seat);
	canvas_cxt.fillStyle = 'rgba(225,0,0,0.9)';
	canvas_cxt.beginPath();
	canvas_cxt
			.arc(pos_button.x + 8, pos_button.y - 5, 12, 0, Math.PI * 2, true);
	canvas_cxt.closePath();
	canvas_cxt.fill();
	canvas_cxt.fillStyle = 'rgba(225,255,255,0.9)';
	canvas_cxt.font = "15px Arial";
	canvas_cxt.textAlign = "start";
	canvas_cxt.fillText("庄", pos_button.x, pos_button.y);
}

function DisplayJetton(seat, jetton) {
	var cxt = GetJettonCanvas(seat);
	cxt.clearRect(0, 0, jetton_canvas_size.x, jetton_canvas_size.y);

	cxt.fillStyle = "#0000FF";
	cxt.font = "15px Arial";
	cxt.textAlign = "center";
	cxt.fillText(jetton, jetton_canvas_size.x / 2, 20);
}

function EnGrayJetton(seat, jetton) {
	var cxt = GetJettonCanvas(seat);
	cxt.clearRect(0, 0, jetton_canvas_size.x, jetton_canvas_size.y);

	cxt.fillStyle = "#C4E1FF";
	cxt.font = "15px Arial";
	cxt.textAlign = "center";
	cxt.fillText(jetton, jetton_canvas_size.x / 2, 20);
}

function DisplayAction(seat, action) {
	var canvas_cxt = GetActionCanvas(seat);
	canvas_cxt.clearRect(0, 0, action_canvas_size.x, action_canvas_size.y);

	canvas_cxt.fillStyle = "#0000FF";
	canvas_cxt.font = "15px Arial";
	canvas_cxt.textAlign = "center";

	var action_name;
	switch (action) {
	case "blind":
		action_name = "盲注";
		break;
	case "call":
		action_name = "跟注";
		audio_player(action, seat);
		break;
	case "raise":
		action_name = "加注";
		audio_player(action, seat);
		break;
	case "all_in":
		action_name = "全押";
		canvas_cxt.fillStyle = '#b55';
		canvas_cxt.font = "bold 15px Arial";
		audio_player(action, seat);
		break;
	case "check":
		action_name = "让牌";
		audio_play(action);
		break;
	case "fold":
		action_name = "弃牌";
		canvas_cxt.fillStyle = '#b55';
		canvas_cxt.font = "bold 15px Arial";
		audio_player(action, seat);
		break;
	}

	canvas_cxt.fillText(action_name, action_canvas_size.x / 2, 20);

}

function DisplayTimeOutPlayer(player_id) {
	var seat = GetSeatOfPlayer(player_id);
	var seat_canvas = document.getElementById("Seat" + seat);
	seat_canvas.style.border = "1px dotted #d3d3d3";
	var canvas_cxt = GetActionCanvas(seat);
	canvas_cxt.clearRect(0, 0, action_canvas_size.x, action_canvas_size.y);

	canvas_cxt.fillStyle = "#0000FF";
	canvas_cxt.font = "15px Arial";
	canvas_cxt.textAlign = "center";

	canvas_cxt.fillText("超时弃牌", action_canvas_size.x / 2, 20);
}

function DisplayOfflinePlayer(player_id) {
	var reg_seq = GetRegSeqOfPlayer(player_id);
	document.getElementById("Player" + reg_seq).innerHTML = player_id + "(掉线)";
}

function DisplayPlayerId(cxt, id) {
	cxt.fillStyle = "#0000FF";
	cxt.font = "15px Arial";
	cxt.textAlign = "center";
	cxt.fillText(id, seat_canvas_size.x / 2, pos_id.y);
}

function EnGrayPlayerId(cxt, id) {
	cxt.fillStyle = "#C4E1FF";
	cxt.font = "15px Arial";
	cxt.textAlign = "center";
	cxt.fillText(id, seat_canvas_size.x / 2, pos_id.y);
}

function DisplayBetOnTable(seat, bet) {
	var canvas_cxt = GetCanvas("Table");
	canvas_cxt.clearRect(bet_pos[seat].x, bet_pos[seat].y - 20, 100, 30);
	canvas_cxt.fillStyle = "#006400";
	canvas_cxt.font = "15px Arial";
	canvas_cxt.fillText(bet, bet_pos[seat].x, bet_pos[seat].y);
}

function DisplayFoldCard0(seat) {
	var canvas_cxt = GetSeatCanvas(seat);
	canvas_cxt.fillStyle = 'rgba(225,225,225,0.8)';
	canvas_cxt.fillRect(pos_holdcard0.x, pos_holdcard0.y, 38, 50);
}

function DisplayFoldCard1(seat) {
	var canvas_cxt = GetSeatCanvas(seat);
	canvas_cxt.fillStyle = 'rgba(225,225,225,0.8)';
	canvas_cxt.fillRect(pos_holdcard1.x, pos_holdcard1.y, 38, 50);
}

function DisplayHoldCardBack0(seat) {
	var canvas_cxt = GetSeatCanvas(seat);
	canvas_cxt.drawPokerBack(pos_holdcard0.x, pos_holdcard0.y, hold_card_size,
			'#2E319C', '#d3d3d3');
}

function DisplayHoldCardBack1(seat) {
	var canvas_cxt = GetSeatCanvas(seat);
	canvas_cxt.drawPokerBack(pos_holdcard1.x, pos_holdcard1.y, hold_card_size,
			'#2E319C', '#d3d3d3');
}

function DisplayHoldCard0(seat, color, point) {
	var canvas_cxt = GetSeatCanvas(seat);
	canvas_cxt.drawPokerCard(pos_holdcard0.x, pos_holdcard0.y, hold_card_size,
			color, point);
}

function DisplayHoldCard1(seat, color, point) {
	var canvas_cxt = GetSeatCanvas(seat);
	canvas_cxt.drawPokerCard(pos_holdcard1.x, pos_holdcard1.y, hold_card_size,
			color, point);
}

function DisplayPublicCard(seq, color, point) {
	var canvas_cxt = GetCanvas("Table");
	canvas_cxt.drawPokerCard(pulic_card_pos[seq].x, pulic_card_pos[seq].y,
			public_card_size, color, point);
}

function DisplayPotNum(pot_num) {
	var pot_canvas = document.getElementById("Pot");
	var canvas_cxt = pot_canvas.getContext("2d");
	canvas_cxt.clearRect(0, 0, pot_size.x, pot_size.y);
	canvas_cxt.fillStyle = "#006400";
	canvas_cxt.font = "15px Arial";
	canvas_cxt.fillText("彩池总额 = " + pot_num, 30, 20);
}

function DisplayNutHand(seat, nuthand) {
	var canvas_cxt = GetCanvas("Action" + seat);

	canvas_cxt.clearRect(0, 0, 100, 30);
	canvas_cxt.fillStyle = "#00FF00";
	canvas_cxt.font = "15px Arial";

	var nut_hand_name = nuthand;
	switch (nuthand) {
	case "HIGH_CARD":
		nut_hand_name = "高牌";
		break;
	case "ONE_PAIR":
		nut_hand_name = "对子";
		break;
	case "TWO_PAIR":
		nut_hand_name = "两对";
		break;
	case "THREE_OF_A_KIND":
		nut_hand_name = "三条";
		break;
	case "STRAIGHT":
		nut_hand_name = "顺子";
		break;
	case "FLUSH":
		nut_hand_name = "同花";
		break;
	case "FULL_HOUSE":
		nut_hand_name = "葫芦";
		break;
	case "FOUR_OF_A_KIND":
		nut_hand_name = "四条";
		break;
	case "STRAIGHT_FLUSH":
		nut_hand_name = "同花顺";
		break;
	default:
		nut_hand_name = "非法";
		break;
	}

	players_on_seat[seat].nut_hand_name = nut_hand_name;
	canvas_cxt.textAlign = "center";
	canvas_cxt.strokeText(nut_hand_name, action_canvas_size.x / 2, 20);
}

function HighlightNutHand(seat) {
	if (players_on_seat[seat].nut_hand_name == null) {
		return;
	}

	var canvas_cxt = GetCanvas("Action" + seat);
	var my_gradient = canvas_cxt.createLinearGradient(0, 0, 0, 15);

	my_gradient.addColorStop(0, "yellow");
	my_gradient.addColorStop(1, "Wheat");

	canvas_cxt.fillStyle = my_gradient;
	canvas_cxt.fillRect(2, 0, 100, 30);

	canvas_cxt.fillStyle = "#00FF00";
	canvas_cxt.font = "15px Arial";
	canvas_cxt.textAlign = "center";
	canvas_cxt.strokeText(players_on_seat[seat].nut_hand_name,
			action_canvas_size.x / 2, 20);
}

function DisplayWinPotNum(seat, win_num) {
	var canvas_cxt = GetCanvas("Jetton" + seat);
	var my_gradient = canvas_cxt.createLinearGradient(0, 0, 0, 15);

	my_gradient.addColorStop(0, "Wheat");
	my_gradient.addColorStop(1, "yellow");
	canvas_cxt.fillStyle = my_gradient;
	canvas_cxt.fillRect(2, 0, 100, 30);
	canvas_cxt.fillStyle = "#00FF00";
	canvas_cxt.font = "15px Arial";
	canvas_cxt.textAlign = "center";
	canvas_cxt.strokeText("+" + win_num, jetton_canvas_size.x / 2, 20);
	HighlightNutHand(seat);
}

function ClearShowdown(seat) {
	var canvas_cxt = GetCanvas("Action" + seat);
	canvas_cxt.fillStyle = "#0000FF";
	canvas_cxt.font = "15px Arial";
	canvas_cxt.clearRect(0, 0, 200, 60);
}

function ClearAllShowdown() {
	for (seat = 0; seat < 8; seat++) {
		ClearShowdown(seat);
	}
}

function GetRegSeqOfPlayer(player_id) {
	for (var regno = 0; regno < players_on_board.length; regno++) {
		if (players_on_board[regno].id == player_id) {
			return regno;
		}
	}

	return -1;
}

function GetPlayerName(player_id) {
	for (var regno = 0; regno < players_on_board.length; regno++) {
		if (players_on_board[regno].id == player_id) {
			return players_on_board[regno].name;
		}
	}

	return players_on_board[regno].id;
}

function GetSeatOfPlayer(player_id) {
	for (var seat = 0; seat < players_on_seat.length; seat++) {
		if (players_on_seat[seat].id == player_id) {
			return seat;
		}
	}
}

function UpdateplayerSeat(player, seat) {
	var canvas_cxt = GetSeatCanvas(seat);
	canvas_cxt.clearRect(0, 0, seat_canvas_size.x, seat_canvas_size.y);
	GetActionCanvas(seat).clearRect(0, 0, action_canvas_size.x,
			action_canvas_size.y);
	if (!player.active) {
		EnGrayPlayerId(canvas_cxt, player.id);
		EnGrayJetton(seat, player.jetton);
	} else {
		DisplayPlayerId(canvas_cxt, player.id);
		DisplayJetton(seat, player.jetton);
	}
}

function GetPlayerHoldCardMsg(msg_str) {
	audio_play("hold_cards");
	var player = msg_str.match(/\d+/);
	var seat = GetSeatOfPlayer(player);
	var colors = msg_str.match(/(SPADES|HEARTS|CLUBS|DIAMONDS)/g);
	var points_str = msg_str.match(/ ([2-9]|10|J|Q|K|A) /g);
	var point0 = points_str[0].match(/([2-9]|10|J|Q|K|A)/g);
	var point1 = points_str[1].match(/([2-9]|10|J|Q|K|A)/g);

	if (!has_manual_player || is_manual_player(seat)) {
		DisplayHoldCard0(seat, colors[0], point0[0]);
		DisplayHoldCard1(seat, colors[1], point1[0]);
	} else {
		DisplayHoldCardBack0(seat);
		DisplayHoldCardBack1(seat);
	}
}

function GetFlopCardMsg(msg_str) {
	NormalizeLastPlayer();
	var lines = msg_str
			.match(/(SPADES|HEARTS|CLUBS|DIAMONDS)\s([2-9]|10|J|Q|K|A)/g);
	for (var i = 0; i < 3; i++) {
		var color = lines[i].match(/(SPADES|HEARTS|CLUBS|DIAMONDS)/);
		var point_str = lines[i].match(/ ([2-9]|10|J|Q|K|A)/g);
		DisplayPublicCard(i, color[0], point_str[0].slice(1));
	}
	audio_play("flop_cards");
}

function GetTurnCardMsg(msg_str) {
	NormalizeLastPlayer();
	audio_play("turn_card");
	var color = msg_str.match(/(SPADES|HEARTS|CLUBS|DIAMONDS)/);
	var point_str = msg_str.match(/ ([2-9]|10|J|Q|K|A)/g);
	DisplayPublicCard(3, color[0], point_str[0].slice(1));
}

function GetRiverCardMsg(msg_str) {
	NormalizeLastPlayer();
	audio_play("river_card");
	var color = msg_str.match(/(SPADES|HEARTS|CLUBS|DIAMONDS)/);
	var point_str = msg_str.match(/ ([2-9]|10|J|Q|K|A)/g);
	DisplayPublicCard(4, color[0], point_str[0].slice(1));
}

function GetPlayerBetMsg(msg_str) {
	var dig = msg_str.match(/\d+/g);
	var seat = GetSeatOfPlayer(dig[0]);
	var bet = dig[1];
	var rest = dig[2];

	players_on_seat[seat].bet = bet;
	players_on_seat[seat].jetton = rest;
	DisplayBetOnTable(seat, bet);
	DisplayJetton(seat, rest);
}

function GetActionMsg(msg_str) {
	NormalizeLastPlayer();
	var player_id = msg_str.match(/\d+/);
	var seat = GetSeatOfPlayer(player_id);
	var action = msg_str.match(/(blind|call|raise|all_in|check|fold|lost)/);

	if (action[0] != "blind") {
		HighlightPlayer(seat);
	} else {
		var table_canvas = GetCanvas("Table");
		table_canvas.clearRect(0, table_size.y / 2 - 20, table_size.x, 40);
	}

	if (action[1] == "fold") {
		DisplayFoldCard0(seat);
		DisplayFoldCard1(seat);
	}

	DisplayAction(seat, action[0]);

	if (is_manual_player(seat)) {
		DisableAllButtons();
	}

}

function GetPotMsg(msg_str) {
	var dig = msg_str.match(/\d+/g);
	pot_num = dig[0];
	current_bet = parseInt(dig[1]);
	minimum_raise = parseInt(dig[2]);
	DisplayPotNum(pot_num);
}

function GetShowdownMsg(msg_str) {
	NormalizeLastPlayer();
	var player_id = msg_str.match(/\d+/);
	var seat = GetSeatOfPlayer(player_id);
	var nuthand = msg_str.match(/: \S+/);
	DisplayNutHand(seat, nuthand[0].slice(2));
	var holdcards = msg_str.match(/\[\S+ \S+\]/g);
	var holdcard0_color = holdcards[0].match(/\[\S+/);
	var holdcard0_point = holdcards[0].match(/\S+\]/);
	var holdcard1_color = holdcards[1].match(/\[\S+/);
	var holdcard1_point = holdcards[1].match(/\S+\]/);
	DisplayHoldCard0(seat, holdcard0_color[0].slice(1), holdcard0_point[0]
			.slice(0, -1));
	DisplayHoldCard1(seat, holdcard1_color[0].slice(1), holdcard1_point[0]
			.slice(0, -1));
}

function GetWinPotMsg(msg_str) {
	var dig = msg_str.match(/\d+/g);
	var player_id = dig[0];
	var seat = GetSeatOfPlayer(player_id);
	var win_num = dig[1];
	DisplayWinPotNum(seat, win_num);
	audio_play("win_pot");
}

function GetScoreMsg(msg_str) {
	var dig = msg_str.match(/\d+/g);
	var player_id = dig[0];
	var hand = dig[1];
	var score = dig[2];
	var jetton = dig[3];
	var rank = dig[4];
	var regno = GetRegSeqOfPlayer(player_id);

	if (regno == -1) {
		if (players_on_board.length >= 8) {
			return;
		} else {
			// ±?????
			var player = {};
			player.id = player_id;
			player.money = score;
			player.jetton = jetton;
			player.name = player_id;
			players_on_board.push(player);
			regno = players_on_board.length - 1;
		}
	}
	DisplayPlayerOnBoard(regno, players_on_board[regno].id, players_on_board[regno].name, rank);
	DisplayScoreOnBoard(regno, hand, score, jetton, rank);
}

function GetPlayerSeatMsg(msg_str) {
	var line = msg_str.match(/\d+\s\d+/g);
	if (0 == players_on_seat.length) {
		for (var i = 0; i < line.length; i = i + 1) {
			var dig = line[i].match(/\d+/g);
			var player = {};
			player.id = dig[0];
			player.jetton = dig[1];
			player.name = GetPlayerName(player.id);
			player.bet = 0;
			players_on_seat.push(player);
			if (manual_player_id == player.id) {
				manual_player_seat = players_on_seat.length - 1;
			}
		}
	}

	for (var seat = 0; seat < players_on_seat.length; seat++) {
		players_on_seat[seat].active = false;
		players_on_seat[seat].nut_hand_name = null;
	}

	for (var i = 0; i < line.length; i = i + 1) {
		var dig = line[i].match(/\d+/g);
		var id = dig[0];
		var jetton = dig[1];
		var seat = GetSeatOfPlayer(id);
		players_on_seat[seat].jetton = jetton;
		players_on_seat[seat].active = true;

		if (i == 0) {
			button = seat;
		}
	}

	for (var seat = 0; seat < players_on_seat.length; seat++) {
		UpdateplayerSeat(players_on_seat[seat], seat);
	}

	DisplayButtonFlag(button);
}

function DisplayHandNo(Hand_no) {
	document.getElementById("HandNo").innerHTML = "记分牌" + "(第" + Hand_no+ "局)";
}

function GetNewHandMsg(msg_str) {
	var game_id_str = msg_str.match(/id=\S+/);
	if (game_id == null) {
		game_id = game_id_str[0].slice(3, -1);
	}

	var hand_no = msg_str.match(/hand \d+/);
	DisplayHandNo(hand_no[0].slice(5));
	var canvas_cxt = GetCanvas("Table");
	canvas_cxt.clearRect(0, 0, table_size.x, table_size.y);
	canvas_cxt.fillStyle = "#0000FF";
	canvas_cxt.font = "20px Arial";
	GetCanvas("Pot").clearRect(0, 0, pot_size.x, pot_size.y);
	GetCanvas("Table").clearRect(0, 0, table_size.x, table_size.y);
	canvas_cxt.fillText("等待开局...", table_size.x / 3, table_size.y / 2);
	ClearAllShowdown();
	audio_play("new_hand");
}

function GetPlayerRegisterMsg(msg_str) {
	var regno = players_on_board.length;
	if (regno >= 8)
		return;
	var name = msg_str.match(/name=\S+/);
	var id = msg_str.match(/id=\d+/);
	var money = msg_str.match(/money=\d+/);
	var player = {};
	player.id = id[0].slice(3);
	player.money = money[0].slice(6);
	player.name = name[0].slice(5);
	players_on_board.push(player);

	if (player.name.search("keyboardclient") != -1) {
		manual_player_id = player.id;
	}

	DisplayPlayerOnBoard(regno, player.id, player.name, 0);
	DisplayScoreOnBoard(regno, 0, player.money, 0, 0);

	GetCanvas("Table").clearRect(0, 0, table_size.x, table_size.y);
}

function GameStart(message_src) {
	GetCanvas("Table").clearRect(0, 0, table_size.x, table_size.y);

	var ctx = GetCanvas("Table");
	ctx.fillStyle = '#FF0000';
	ctx.font = "20px Arial";
	ctx.fillText("Game start...", table_size.x / 3, table_size.y / 2);

	players_on_seat = [];
	players_on_board = [];
	current_seat = -1;
	button = 0;

	if (message_src == GAME_SERVER_MSG) {
		playback_status = 0;
		document.getElementById('log').innerHTML = "game start";
		document.getElementById("replay_b").disabled = true;
		document.getElementById("speedup_b").disabled = true;
		document.getElementById("speeddown_b").disabled = true;

		init_player_socket();

	} else {
		document.getElementById('log').innerHTML = "play back";
		document.getElementById("replay_b").disabled = false;
		document.getElementById("speedup_b").disabled = false;
		document.getElementById("speeddown_b").disabled = false;
	}
}

function GetGameStartMsg(msg_str, message_src) {
	game_id = msg_str.match(/id=\S+/);
	game_id = game_id[0].slice(3, -1);

	GameStart(message_src);
}

function GetTimeOutMsg(msg_str) {
	var dig = msg_str.match(/\d+/g);
	DisplayTimeOutPlayer(dig[0]);
}

function GetOfflineMsg(msg_str) {
	var dig = msg_str.match(/\d+/g);
	DisplayOfflinePlayer(dig[0]);
}

function GetGameOverMsg(msg_str) {
	document.getElementById('log').innerHTML = "game over";
	document.getElementById("replay_b").disabled = false;
	document.getElementById("speedup_b").disabled = false;
	document.getElementById("speeddown_b").disabled = false;
	playback_status == 0;
}

function GetMsg(message_data, message_src) {
	if (message_data.search(/game start/) != -1) {
		GetGameStartMsg(message_data, message_src);
	} else if (message_data.search(/reg:/) != -1) {
		GetPlayerRegisterMsg(message_data);
	} else if (message_data.search(/hand/) != -1) {
		GetNewHandMsg(message_data);
	} else if (message_data.search(/seat/) != -1) {
		GetPlayerSeatMsg(message_data);
	} else if (message_data.search(/score/) != -1) {
		GetScoreMsg(message_data);
	} else if (message_data.search(/bet/) != -1
			&& message_data.search(/rest/) != -1) {
		GetPlayerBetMsg(message_data);
	} else if (message_data.search(/hold/) != -1) {
		GetPlayerHoldCardMsg(message_data);
	} else if (message_data.search(/flop/) != -1) {
		GetFlopCardMsg(message_data);
	} else if (message_data.search(/turn/) != -1) {
		GetTurnCardMsg(message_data);
	} else if (message_data.search(/river/) != -1) {
		GetRiverCardMsg(message_data);
	} else if (message_data.search(/action/) != -1) {
		GetActionMsg(message_data);
	} else if (message_data.search(/pot num/) != -1) {
		GetPotMsg(message_data);
	} else if (message_data.search(/show down/) != -1) {
		GetShowdownMsg(message_data);
	} else if (message_data.search(/win pot/) != -1) {
		GetWinPotMsg(message_data);
	} else if (message_data.search(/time out/) != -1) {
		GetTimeOutMsg(message_data);
	} else if (message_data.search(/off line/) != -1) {
		GetOfflineMsg(message_data);
	} else if (message_data.search(/game over/) != -1) {
		GetGameOverMsg(message_data);
	}
}

function SpeedUp() {

	if (playback_speed_ms <= 50) {
		return;
	}

	playback_speed_ms -= 50;
}

function SpeedDown() {
	playback_speed_ms += 50;
}

function GetPlayBackMsg() {
	if (playback_msg_index >= playback_msgs.length) {
		playback_status = 3; // 回放结束状态
		document.getElementById('log').innerHTML = "play back finish";
		document.getElementById("replay_b").innerHTML = "回放";
		return;
	}

	if (playback_status == 2) {
		return;
	}

	GetMsg(playback_msgs[playback_msg_index], PLAY_BACK_MSG);
	document.getElementById('log').innerHTML = "play back step "
			+ playback_msg_index + " / " + playback_msgs.length;
	playback_msg_index++;
	setTimeout("GetPlayBackMsg()", playback_speed_ms);
}

function PlayBack(replay_data) {
	playback_msgs = replay_data.split(/\n-\d+>/);
	playback_msg_index = 1;
	GetPlayBackMsg();
}

function ReplayOnclick() {
	if (playback_status == 0)// 初始状态
	{
		document.getElementById('log').innerHTML = "play back...";
		var xmlhttp;
		xmlhttp = new XMLHttpRequest();
    if (replay !=null){
      xmlhttp.open("GET", "/contestmanager/getReplayFile.php?match_seq_id="+replay, false);
      xmlhttp.send();
      var response = eval("("+xmlhttp.responseText+")");
      if (response.error !== undefined){
        alert(response.error);
        return;
      }
      xmlhttp.open("GET", response.data.url, false);
    }else{   
      if (game_id != null){    
        xmlhttp.open("GET", game_id + ".txt", false);
      }
      else
      {
        xmlhttp.open("GET", "replay.txt", false);
      }
    }
		xmlhttp.send();
		playback_status = 1;
		document.getElementById("replay_b").innerHTML = "暂停";
		PlayBack(xmlhttp.responseText);
	} else if (playback_status == 1)// 回放进行状态
	{
		// 进入暂停态
		playback_status = 2;
		document.getElementById("replay_b").innerHTML = "继续";
	} else if (playback_status == 2)// 回放暂停状态
	{
		// 恢复到进行态
		playback_status = 1;
		document.getElementById("replay_b").innerHTML = "暂停";
		GetPlayBackMsg();
	} else if (playback_status == 3) // 回放结束状态
	{
		// 重新回放
		playback_status = 1;
		document.getElementById("replay_b").innerHTML = "暂停";
		playback_msg_index = 1;
		GetPlayBackMsg();
	}
}

function init_viewer_socket() {
	with (document.getElementById('log')) {
    if (! hasAttribute('status')){
      setAttribute('status','connecting');
      var wsurl = 'ws://127.0.0.1:3355';
      if (live !== null)
      {
        var loc = window.location;
        if (loc.protocol === "https:") {
          wsurl = "wss:";
        } else {
          wsurl = "ws:";
        }
        wsurl += "//10.142.192.79";
        wsurl +=  ":" + live;
      }
      socket_of_view = new WebSocket(wsurl);
      socket_of_view.onopen = function(evt) {
        innerHTML = '<p> connect to viewserver ok';
        setAttribute('status','connected');
      }

      socket_of_view.onclose = function(evt) {
        innerHTML = '<p> viewserver disconnected';
        removeAttribute('status');
      }

      socket_of_view.onerror = function(evt) {
        innerHTML = '<p> viewer socket error: ' + evt.data;
        removeAttribute('status');
      }

      socket_of_view.onmessage = function(message) {
        GetMsg(message.data, GAME_SERVER_MSG);
        /* innerHTML = message.data; */
      }
    }
	}
}

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数
  if (r != null) return unescape(r[2]); return null; //返回参数值
}
        
function initialize() {
  init_pos();
  replay = getUrlParam('replay');
  live = getUrlParam('live');
  //if (replay !== null)
  //{
    document.getElementById("replay_b").disabled=false;
    document.getElementById("speedup_b").disabled=false;
    document.getElementById("speeddown_b").disabled=false;  
    ReplayOnclick();
  //}else{
  //  document.getElementById("replay_b").disabled=true;
  //  document.getElementById("speedup_b").disabled=true;
  //  document.getElementById("speeddown_b").disabled=true;  
  //  if (window.WebSocket) {
  //    setInterval(init_viewer_socket, 1000 * 10); //five second monitor
  //  } else {
  //    innerHTML += '<p> HTML5 WebSocket is not supported in your browser, please open with firefox.';
  //  }
  //}

}