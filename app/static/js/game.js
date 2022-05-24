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
		if (this.velocityX != 0) this.velocityX += (this.velocityX > 0) ? -1*friction_a: friction_a;
		if (this.velocityY != 0) this.velocityY += (this.velocityY > 0) ? -1*friction_a: friction_a;

		this.x += this.velocityX;
		this.y += this.velocityY;
	}

	//http://www.themcclungs.net/physics/download/H/Momentum/ElasticCollisions.pdf
	
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