var board = document.getElementById("canvas"),
	board_elem = board.getContext('2d'),
	bwidth = 770,
	bheight = 520,
	center_x = bwidth / 2,
	center_y = bheight / 2,
	goal = document.getElementsByClassName('table__goal-crease'),
	goal_area = goal[0].clientHeight,
	goal_corr = (bheight - goal_area) / 2,
	score = [0, 0];

board.width = bwidth;
board.height = bheight;

board.focus();

function Disc() {

	this.x_init = center_x;
	this.y_init = center_y;
	this.x = this.x_init;
	this.y = this.y_init;
	this.radius = 35;
	this.velocityX = 0;
	this.velocityY = 0;
	this.mass = 15;
	this.speed_limit = 10;
	this.a = 1.0;
	this.self_color = '#000000';

	this.playerRules = function() {
		if (this.y > (bheight - this.radius) || this.y < this.radius) {
			if (this.y < this.radius) this.velocityY = 2;
			else this.velocityY = -2;
		}
		if (this.x > (bwidth - this.radius) || this.x < this.radius) {
			if (this.x < this.radius) this.velocityX = 2;
			else this.velocityX = -2;
		}
		//if (playerOne.x > (center_x - playerOne.radius) && playerOne.x < center_x) playerOne.velocityX = -3;
	}

	this.puckRules = function() {
		var goal_scored = this.y > (goal_corr + puck.radius) && this.y < (goal_corr + goal_area) - puck.radius
		if (this.x > (bwidth - this.radius) || this.x < this.radius) {
			if (this.x > (bwidth - this.radius)) {
				this.x = bwidth - this.radius;
				if (goal_scored) {
					puck = new Disc(center_x, center_y);
					score[0] += 1;
				}
			} else {
				this.x = this.radius;
				if (goal_scored) {
					puck = new Disc(center_x, center_y);
					score[1] += 1;
				}
			}
			if (score[0] === 3 || score[1] === 3) window.location.replace((score[0] === 3) ? "/win" : "/lose");
			this.velocityX = -this.velocityX;
		}	
		if (this.y > (bheight - this.radius) || this.y < this.radius) {
			if (this.y > (bheight - this.radius)) this.y = bheight - this.radius;
			else this.y = this.radius;

			this.velocityY = -this.velocityY;
		}
	}

	this.draw = function() {
		board_elem.shadowColor = 'rgba(50, 50, 50, 0.25)';
		board_elem.shadowOffsetX = 0;
		board_elem.shadowOffsetY = 3;
		board_elem.shadowBlur = 6;

		board_elem.beginPath();
		board_elem.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
		board_elem.fillStyle = this.self_color;
		board_elem.fill();
	}

	this.move = function() {
		friction_a = friction*9.8 // ma = umg, m cancels out, a = ug, g ~ 9.8
		if (!(this.velocityX >= -1 * friction_a && this.velocityX <= friction_a)) this.velocityX += (this.velocityX > 0) ? -1*friction_a: friction_a;
		else this.velocityX = 0;
		if (!(this.velocityY >= -1 * friction_a && this.velocityY <= friction_a)) this.velocityY += (this.velocityY > 0) ? -1*friction_a: friction_a;
		else this.velocityY = 0;

		this.x += this.velocityX;
		this.y += this.velocityY;
	}

	//http://www.themcclungs.net/physics/download/H/Momentum/ElasticCollisions.pdf
	this.discCollision = function(player) {	// polar-esque haha how FUN	
		function pythag(x_side, y_side) {
			return Math.sqrt(Math.pow(x_side,2) + Math.pow(y_side,2));
		}
		function translate(x, y, sin, cos, reverse) { //converts points on to new coordinate grid for the collision handling (more on this below)
			return {
				x: (reverse) ? (x * cos + y * sin) : (x * cos - y * sin),
				y: (reverse) ? (y * cos - x * sin) : (y * cos + x * sin)
			};
		}

		var x_distance = this.x - player.x, y_distance = this.y - player.y
		var current_distance_between_centers = pythag(x_distance, y_distance),
			min_distance_between_centers = this.radius + player.radius;		
		
		if (current_distance_between_centers < min_distance_between_centers) {
			// reset the coordinate grid to start at player (make it 0,0)
			var angle = Math.atan2(y_distance, x_distance), 
				sin = Math.sin(angle),
				cos = Math.cos(angle),
				pos0 = {x: 0, y: 0}, // set the players position to 0,0 --> essentially remaking grid
				pos1 = translate(x_distance, y_distance, sin, cos, true), //locate the puck's position on this new coordinate grid
				v1 = translate(player.velocityX, player.velocityY, sin, cos, true), //get v1i from the og grids vectors
				v2 = translate(this.velocityX, this.velocityY, sin, cos, true); // get v2i from the og grids vectors
				velocityXTotal = v1.x - v2.x;
				massTotal = (player.mass + this.mass); // jst good old m1v1
			
			// good old equation for v2f elastic collisions using m1, m2, v1i, and v2i
			v1.x = ((player.mass - this.mass) * v1.x + 2 * this.mass * v2.x) / massTotal; 
			v2.x = velocityXTotal + v1.x; //obtained v1f and v2f

			// this stuff is to prevent sticking after collisions (basically when a collision results in a too low of a velocity to escape the overlap this accounts for it)
			// thanks to the intertrash for the following, this was a pain to figure out
			var absV = Math.abs(v1.x) + Math.abs(v2.x), 
				overlap = (player.radius + this.radius) - Math.abs(pos0.x - pos1.x);

			pos0.x += v1.x / absV * overlap;
			pos1.x += v2.x / absV * overlap;
			
			// now convert everything back to yk, the og coordinate grid
			var pos0F = translate(pos0.x, pos0.y, sin, cos, false), 
				pos1F = translate(pos1.x, pos1.y, sin, cos, false);

			this.x = player.x + pos1F.x; //apply position changes so we dont get infinite collisions
			this.y = player.y + pos1F.y;
			player.x = player.x + pos0F.x;
			player.y = player.y + pos0F.y; //these vars rnt named the best ik mb

			var vel0F = translate(v1.x, v1.y, sin, cos, false), 
				vel1F = translate(v2.x, v2.y, sin, cos, false);
			
			// finally finally finally after taking a trip to theta land, we come back and adjust the vars we actually care about
			player.velocityX = vel0F.x;
			player.velocityY = vel0F.y;

			this.velocityX = vel1F.x;
			this.velocityY = vel1F.y;
		}
	}
}

function moveplayerone(key) {
	if (key === "w" && playerOne.velocityY < playerOne.speed_limit) playerOne.velocityY -= playerOne.acceleration;
	if (key === "s" && playerOne.velocityY < playerOne.speed_limit) playerOne.velocityY += playerOne.acceleration;
	if (key === "d" && playerOne.velocityX < playerOne.speed_limit) playerOne.velocityX += playerOne.acceleration;
	if (key === "a" && playerOne.velocityX < playerOne.speed_limit) playerOne.velocityX -= playerOne.acceleration;
}

function updateGame() {
	board_elem.clearRect(0, 0, bwidth, bheight);
	puck.draw();
	puck.move();
	puck.puckRules();
	puck.discCollision(playerOne);
	playerOne.draw();
	playerOne.move();
	playerOne.playerRules();

	requestAnimationFrame(updateGame);
}

document.addEventListener("keydown", function(e) {
	moveplayerone(e.key);
});

var puck = new Disc();

var playerOne = new Disc();
playerOne.x_init = 130;
playerOne.mass = 45;
playerOne.x = playerOne.x_init;
playerOne.radius = 45;
playerOne.acceleration = 5;

updateGame();