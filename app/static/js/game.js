var board = document.getElementById("canvas"),
	board_elem = board.getContext('2d'),
	bwidth = 770,
	bheight = 520,
	center_x = bwidth / 2,
	center_y = bheight / 2,
	goal = document.getElementsByClassName('table__goal-crease'),
	goal_area = goal[0].clientHeight,
	goal_corr = (bheight - goal_area) / 2,
	score = [];

board.width = bwidth;
board.height = bheight;

board.focus();

function Disc() {

	this.x_init = center_x;
	this.y_init = center_y;
	this.x = this.x_init;
	this.y = this.y_init;
	this.radius = 34;
	this.velocityX = 0;
	this.velocityY = 0;
	this.mass = 15;
	this.speed_limit = 10;
	this.a = 1.0;
	this.self_color = '#000000';

	this.playerRules = function() {
		if (this.x > (bwidth - this.radius) || this.x < this.radius) {
			if (this.x < this.radius) this.velocityX = 2;
			else this.velocityX = -2;
		}
		if (this.y > (bheight - this.radius) || this.y < this.radius) {
			if (this.y < this.radius) this.velocityY = 2;
			else this.velocityY = -2;
		}
		if (playerOne.x > (center_x - playerOne.radius) && playerOne.x < center_x) playerOne.velocityX = -3;
	}

	this.puckRules = function() {
		if (this.x > (bwidth - this.radius) || this.x < this.radius) {
			if (this.x > (bwidth - this.radius)) this.x = bwidth - this.radius;
			else this.x = this.radius;

			this.velocityX = -this.velocityX;
			if (this.y > (goal_corr + puck.radius) && this.y < (goal_corr + goal_area) - puck.radius) puck = new Disc(center_x, center_y);
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
		friction_a = friction*9.8
		if (this.velocityX != 0) this.velocityX += (this.velocityX > 0) ? -1*friction_a: friction_a;
		if (this.velocityY != 0) this.velocityY += (this.velocityY > 0) ? -1*friction_a: friction_a;

		this.x += this.velocityX;
		this.y += this.velocityY;
	}

	
}

function rotate(x, y, sin, cos, reverse) {
	return {
		x: (reverse) ? (x * cos + y * sin) : (x * cos - y * sin),
		y: (reverse) ? (y * cos - x * sin) : (y * cos + x * sin)
	};
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
playerOne.radius += 10;
playerOne.acceleration = 5;
playerOne.x_init = 125;
playerOne.mass = 50;
playerOne.x = playerOne.x_init;

updateGame();