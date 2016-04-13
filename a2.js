
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

function Rectangle(canvas, x, y, width, height, color) {
    if (canvas) {
        this.context = canvas.getContext("2d");
        this.x = x;
        this.y = y;
		this.color = color;
		this.width = width;
		this.height = height;
    }
}
Rectangle.prototype.draw = function(){
	this.context.beginPath();
	this.context.rect(this.x,this.y,this.width,this.height);
    this.context.fillStyle = this.color;
    this.context.fill();
}

Rectangle.prototype.testHit = function(testX, testY) {
	if (this.width == c.width){    // top wall
		if (this.y < testY && this.y + this.height > testY)
			return true;
	}
	if (this.height == c.height){ // side walls
		if (this.x < testX && this.x + this.width > testX)  
			return true;
	}
	if (this.x < testX && this.x + this.width > testX && this.y < testY && this.y + this.height > testY)  // paddle
		return true;
	return false;
};

function Block(canvas, x, y, width, height, color){
	Rectangle.call(this, canvas, x*80 + 60, y *25 + 100, width, height, color);
	this.point = 8 - (Math.floor(y/2) *2 + 1);
}
Block.prototype = new Rectangle();
Block.prototype.constructor = Block;

Block.prototype.draw = function(){
	this.context.beginPath();
	this.context.rect(this.x,this.y,this.width,this.height);
    this.context.fillStyle = this.color;
	this.context.strokeStyle = "black";
	this.context.stroke();
    this.context.fill();
}

Block.prototype.testHit = function(testX, testY) {
	if (y_change > 0){
		if (this.x < testX && this.x + this.width > testX && this.y < testY - 16 && this.y + this.height > testY - 16) // from bottom
			return true;
	} else {
		if (this.x < testX && this.x + this.width > testX && this.y < testY + 16 && this.y + this.height > testY + 16)  // from top
			return true;
	}
	return false;
};

function Circle(canvas,x,y, radius,color) {
    if (canvas) {
        this.context = canvas.getContext("2d");
        this.x = x;
        this.y = y;
		this.color = color;
        this.radius = radius;		
    }
}

Circle.prototype.draw = function(){
	this.context.beginPath();
	this.context.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    this.context.fillStyle = this.color;
	this.context.strokeStyle = "black";
	this.context.stroke();
    this.context.fill();
};

//var rec = new Rectangle(c,30,50,"red");
var blocks = [];
var COLORS = ["red", "orange", "green", "yellow"];
//ctx.clearRect(0,0,c.width,c.height);

var ball = new Circle(c, 600, 500, 12, "grey");
var animate;
var paddle = new Rectangle(c, 540, 619, 150, 20, "brown");
var gameStart = false;
var leftWall = new Rectangle(c, 0, 0, 60, c.height,"grey")
var rightWall = new Rectangle(c, c.width - 60, 0, 60, c.height,"grey")
var topWall = new Rectangle(c, 0, 0, c.width, 50,"grey")
var angle = Math.PI - Math.PI/4;
var x_change = 0;
var y_change = 0;
var scoreBoard = document.getElementById("s");
var lifeBoard = document.getElementById("l");
var clearOnce = false;
var points;
var life;
scoreBoard.textContent = "SCORE: ".concat(points);
lifeBoard.textContent = " LIFE: ".concat(life);

newGame();

function newGame(){
	life = 5;
	points = 0;
	scoreBoard.textContent = "SCORE: ".concat(points);
	lifeBoard.textContent = " LIFE: ".concat(life);
	newlevel();
	newlife();
}
function newlevel() {
	for (j = 0; j < 8; j++) {
		blocks[j] = [];
		color = COLORS[Math.floor(j/2)];
		for (i = 0; i < 14; i++) {
			blocks[j][i] = new Block(c, i, j, 79, 24, color);		
		}
	}
	drawShapes();
}
function newlife(){
	gameStart = false;
	ball.x = paddle.x + 75;
	ball.y = paddle.y - 15;
	c.onclick = function(){ move()};
	angle = Math.PI - Math.PI/4;
	drawShapes();
}
function movePaddle(e){
	if (e.clientX > c.width-211) {
		paddle.x = c.width - 211;
	}else if(e.clientX < 62){
		paddle.x = 62;
	}else{
		paddle.x = e.clientX;
	}
	if (!gameStart){
		ball.x = paddle.x + 75;
		ball.y = paddle.y - 15;
	}
	drawShapes();
}

function move(){   //ball
	c.onclick = function(){};
	gameStart = true;
	x_change = Math.cos(angle) * 10;
	y_change = Math.sin(angle) * 10;
	ball.x = ball.x - x_change;
	ball.y = ball.y - y_change;
	
	if (leftWall.testHit(ball.x - 16, ball.y - 16))         // collisions
		angle = Math.PI - angle;
	if (rightWall.testHit(ball.x + 16, ball.y - 16))
		angle = Math.PI - angle;
	if (topWall.testHit(ball.x, ball.y - 16))
		angle = angle * -1;
	for (j = 0; j < 8; j++) {
		for (i = 0; i < 14; i++) {
			if (blocks[j][i] != null){
				
				if (blocks[j][i].testHit(ball.x, ball.y)){
					angle = angle * - 1;
					points += blocks[j][i].point;
					scoreBoard.textContent = "SCORE: ".concat(points);
					blocks[j][i] = null;
				}
			}
		}
	}
	if (paddle.testHit(ball.x, ball.y + 14))
		angle = angle * -1;
	//if (ball.y > paddle.y)   // auto testing
	//	angle = angle * -1;
	if (ball.y > 275 && points == 448 && clearOnce == false){
		newlevel();
		clearOnce = true;
	}
	drawShapes();
	 // call moveRight in 20msec
	animate = setTimeout(move,20);
	if (ball.y > paddle.y + 16){
		clearTimeout(animate);
		life = life - 1;
		lifeBoard.textContent = " LIFE: ".concat(life);
		if (life == 0){
			alert("Game over!");
			newGame();
		}
		newlife();
	}
	if (points == 896){
		clearTimeout(animate);
		alert("Congratulations!");
		newGame();
	}
	
}
function drawShapes() {
	//Clear the canvas
	ctx.clearRect(0,0,c.width,c.height);
		//console.log(e.clientX);
	paddle.draw();
	ball.draw();
	leftWall.draw();
	rightWall.draw();
	topWall.draw();
	//blocks[7][9] = null;
	for (j = 0; j < 8; j++) {
		for (i = 0; i < 14; i++) {
			if (blocks[j][i] != null){
				blocks[j][i].draw();
				
			}
		}
	}
	
}
