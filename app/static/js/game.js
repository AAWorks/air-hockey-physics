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

class Sphere {
	constructor(x, y, r, m, a, c, vix, viy) {
		this.x_init = x;
		this.y_init = y;
		this.x = this.x_init;
		this.y = this.y_init;
		this.radius = r;
		this.mass = m;
		this.a = a;
		this.self_color = c;
		this.velocityX = vix;
		this.velocityY = viy;
		this.speed_limit = 10;
	}

	playerRules = function() {
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

	puckRules = function() {
		function resetPuck() {
			puck.x = center_x;
			puck.y = center_y;
			puck.velocityX = 8;
			puck.velocityY = 8;
		}
		var goal_scored = this.y > (goal_corr + puck.radius) && this.y < (goal_corr + goal_area) - puck.radius
		if (this.x > (bwidth - this.radius) || this.x < this.radius) {
			if (this.x > (bwidth - this.radius)) {
				this.x = bwidth - this.radius;
				if (goal_scored) {
					resetPuck();
					score[0] += 1;
				}
			} else {
				this.x = this.radius;
				if (goal_scored) {
					resetPuck();
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

	draw = function() {
		board_elem.shadowColor = 'rgba(50, 50, 50, 0.25)';
		board_elem.shadowOffsetX = 0;
		board_elem.shadowOffsetY = 3;
		board_elem.shadowBlur = 6;

		board_elem.beginPath();
		board_elem.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
		board_elem.fillStyle = this.self_color;
		board_elem.fill();
	}

	move = function() {
		var friction_a = friction*9.8 // ma = umg, m cancels out, a = ug, g ~ 9.8
		if (!(this.velocityX >= -1 * friction_a && this.velocityX <= friction_a)) this.velocityX += (this.velocityX > 0) ? -1*friction_a: friction_a;
		else this.velocityX = 0;
		if (!(this.velocityY >= -1 * friction_a && this.velocityY <= friction_a)) this.velocityY += (this.velocityY > 0) ? -1*friction_a: friction_a;
		else this.velocityY = 0;

		this.x += this.velocityX;
		this.y += this.velocityY;
	}

	//http://www.themcclungs.net/physics/download/H/Momentum/ElasticCollisions.pdf
	trackCollisions = function(player) {
		function pythag(x_side, y_side) {
			return Math.sqrt(Math.pow(x_side,2) + Math.pow(y_side,2));
		}
		function translate(x, y, angle, reverse) { //converts points on to new coordinate grid for the collision handling (more on this below)
			var theta = Math.cos(angle), phi = Math.sin(angle);
			return {
				x: (reverse) ? (x * theta + y * phi) : (x * theta - y * phi),
				y: (reverse) ? (y * theta - x * phi) : (y * theta + x * phi)
			};
		}

		var x_distance = this.x - player.x, y_distance = this.y - player.y
		var current_distance_between_centers = pythag(x_distance, y_distance),
			min_distance_between_centers = this.radius + player.radius;		
		
		if (current_distance_between_centers < min_distance_between_centers) {
			// take a snapshot of the collision --> have the collision move at the same rate as the player
			// (centered around player)
			var angle = Math.atan2(y_distance, x_distance), 
				s_init = {x: 0, y: 0}, // set the players position to 0,0 --> essentially remaking grid
				s = translate(x_distance, y_distance, angle, true), //locate the puck's position on this new coordinate grid
				v1 = translate(player.velocityX, player.velocityY, angle, true), //get v1i from the og grids vectors
				v2 = translate(this.velocityX, this.velocityY, angle, true); // get v2i from the og grids vectors
				const velocityXTotal = v1.x - v2.x;
				const massTotal = (player.mass + this.mass); // jst good old m1v1
			
			// good old equation for v2f elastic collisions using m1, m2, v1i, and v2i
			v1.x = ((player.mass - this.mass) * v1.x + 2 * this.mass * v2.x) / massTotal; 
			v2.x = velocityXTotal + v1.x; //obtained v1f and v2f
		}
	}
}

function moveplayerone(key) {
	if (key === "w" && playerOne.velocityY < playerOne.speed_limit) playerOne.velocityY -= playerOne.a;
	if (key === "s" && playerOne.velocityY < playerOne.speed_limit) playerOne.velocityY += playerOne.a;
	if (key === "d" && playerOne.velocityX < playerOne.speed_limit) playerOne.velocityX += playerOne.a;
	if (key === "a" && playerOne.velocityX < playerOne.speed_limit) playerOne.velocityX -= playerOne.a;
}

function updateGame() {
	board_elem.clearRect(0, 0, bwidth, bheight);
	puck.draw();
	puck.move();
	puck.puckRules();
	puck.trackCollisions(playerOne);
	playerOne.draw();
	playerOne.move();
	playerOne.playerRules();

	requestAnimationFrame(updateGame);
}

document.addEventListener("keydown", function(e) {
	moveplayerone(e.key);
});

const puck = new Sphere(center_x, center_y, 35, 15, 1, '#000000', 8, 8);
const playerOne = new Sphere(120, center_y, 45, 45, 5, '#000000', 0, 0);

updateGame();