var board = document.getElementById("canvas"),
	board_elem = board.getContext('2d'),
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
	constructor(x, y, r, m, a, c, vix, viy, typ) {
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
		this.typ = typ;
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
		if (playerOne.x > (center_x - playerOne.radius) && playerOne.x < center_x) playerOne.velocityX = -3;
		if (playerTwo.x < (center_x + playerTwo.radius) && playerTwo.x > center_x) playerTwo.velocityX = 3;

	}

	puckRules = function() {
		function resetPuck(m) {
			puck.x = center_x;
			puck.y = center_y;
			puck.velocityX = 0;
			puck.velocityY = 0;
			puck.mass = m;
		}
		var goal_scored = this.y > (goal_corr + puck.radius) && this.y < (goal_corr + goal_area) - puck.radius
		const scorecard = document.getElementById('scorecard');
		
		if (this.x > (bwidth - this.radius) || this.x < this.radius) {
			if (this.x > (bwidth - this.radius)) {
				this.x = bwidth - this.radius;
				if (goal_scored) {
					score[0] += 1;
					resetPuck(puck_mass)
			scorecard.innerHTML = 
						"<img src='static/images/" + score[0].toString() + ".png' style='float: left;'><img src='static/images/" + score[1].toString() + ".png' style='float: right;'>";
				}
			} else {
				this.x = this.radius;
				if (goal_scored) {
					score[1] += 1;
					resetPuck(puck_mass)
					scorecard.innerHTML = 
					"<img src='static/images/" + score[0].toString() + ".png' style='float: left;'><img src='static/images/" + score[1].toString() + ".png' style='float: right;'>";				}
			}
			if (score[0] === 3 || score[1] === 3) {
				resetPuck(player_mass * 10);
				setTimeout(function(){window.location.replace((score[0] === 3) ? "/win" : "/lose")}, 2000);
			}
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
		// ma = umg, m cancels out, a = ug, g ~ 9.8
		var friction_a = (this.typ === 'puck') ? friction*9.8 : 0.001 * 9.8;
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
		function fix_pos(v){
			if (Math.abs(v1.x) + Math.abs(v2.x) == 0) return 0
			return v * (80 - Math.abs(s_init.x - s.x)) / (Math.abs(v1.x) + Math.abs(v2.x)) 
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
			//fix sticking
			s_init.x += fix_pos(v1.x)
			s.x += fix_pos(v2.x)

			// now convert everything back to yk, the og coordinate grid
			var s_init_f = translate(s_init.x, s_init.y, angle, false), 
				sf = translate(s.x, s.y, angle, false);

			this.x = player.x + sf.x; //apply position changes so we dont get infinite collisions
			this.y = player.y + sf.y;
			player.x = player.x + s_init_f.x;
			player.y = player.y + s_init_f.y; //these vars rnt named the best ik mb

			var v1f = translate(v1.x, v1.y, angle, false), 
				v2f = translate(v2.x, v2.y, angle, false);
			
			// finally finally finally after taking a trip to theta land, we come back and adjust the vars we actually care about
			player.velocityX = v1f.x;
			player.velocityY = v1f.y;

			this.velocityX = v2f.x;
			this.velocityY = v2f.y;
		}
	}
}

function bindings(key, player, keys) {
	if (key === keys[0] && player.velocityY < player.speed_limit) player.velocityY -= player.a;
	if (key === keys[1] && player.velocityY < player.speed_limit) player.velocityY += player.a;
	if (key === keys[2] && player.velocityX < player.speed_limit) player.velocityX += player.a;
	if (key === keys[3] && player.velocityX < player.speed_limit) player.velocityX -= player.a;
}

function moveplayer(key) {
	bindings(key, playerOne, ["w","s","d","a"])
	bindings(key, playerTwo, ["ArrowUp","ArrowDown","ArrowRight","ArrowLeft"])
}

function updateGame() {
	board_elem.clearRect(0, 0, bwidth, bheight);
	puck.draw();
	puck.move();
	puck.puckRules();
	puck.trackCollisions(playerOne);
	puck.trackCollisions(playerTwo);
	playerOne.draw();
	playerOne.move();
	playerOne.playerRules();
	playerTwo.draw();
	playerTwo.move();
	playerTwo.playerRules();

	requestAnimationFrame(updateGame);
}

document.addEventListener("keydown", function(e) {
	moveplayer(e.key);
});

window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

const puck = new Sphere(center_x, center_y, puck_r, puck_mass, 1, '#696969', 0, 0, "puck");
const playerOne = new Sphere(120, center_y, player_r, player_mass, 5, '#87CEFA', 0, 0, "player");
const playerTwo = new Sphere(bwidth - 120, center_y, player_r, player_mass, 5, '#FF8C00', 0, 0, "player")

updateGame();