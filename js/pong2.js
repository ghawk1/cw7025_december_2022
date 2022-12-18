
const ball_size = 30;
const ball_radius = ball_size/2;
const paddle_width = 20;
const user_paddle_height = 100;
const field_width = 600;
const field_height = 400;
const center = [field_width/2-ball_radius, field_height/2-ball_radius];
var y = 0;
var balls = [];
var ball_count = 0;
var paddles = [];
var powerups = [];
var powerup_count = 0;
var types = ["multiball", "slowball", "fastball", "colorball"];
var start_time = 0;
var end_time = 0;



$(document).ready(function()
{ //makes sure the document is ready and loaded before doing anything
    class Ball
    { //class to construct, move, and score balls
        constructor(x, y, size, speed, index)
        { //function to initialize the balls
            this.x = x; //x-coordinate for ball
            this.y = y; //y-coordinate for ball
            this.size = size; //size of ball in pixels
            this.radius = size/2; //radius of ball on pixels
            this.speed = speed; //speed of ball
            this.dx = (Math.random()/2+1) * (Math.random() < 0.5 ? -1 : 1); //direction in x-axis randomized between -1 to -0.5 or 0.5 to 1
            this.dy = (Math.random()/2+1) * (Math.random() < 0.5 ? -1 : 1); //direction in y-axis randomized between -1 to -0.5 or 0.5 to 1
            this.index = index; //html index of ball
            this.bounced = false; //bool to keep track of if the ball has recently bounced against a paddle
            if (balls[0] && balls[0].colored){this.colored = true;} //bool to keep track of if the ball has a multicolor powerup
            else{this.colored = false;} // " "
        }
        
        move()
        { //function to move the pong ball around the screen
            this.x += this.dx * this.speed; //update ball's x-axis coordinate based on speed and direction
            this.y += this.dy * this.speed; //update ball's y-axis coordinate based on speed and direction
            if (this.bounced)
            { //if the ball has recently bounced against a paddle
                if (this.x > 100 && this.x < 150 || this.x > 450 && this.x < 500)
                { //if the ball is outside of the recent bounce area
                    this.bounced = false; //change the recent bool to false
                }
            }
            
            else if((this.x < 50 && this.x>20) && (this.y < paddles[0].y+paddles[0].h && this.y > paddles[0].y-paddles[0].h/2))
            { //if the ball hits the user's paddle
                this.dx *= -1; //reverse direction in the x-axis
                make_powerup(powerup_count); //give a chance to release a powerup
                document.querySelector('#bounce_sound').play(); //play a bouncing sound
                this.bounced = true; //change the recent bounce bool to be true
            }
            
            else if((this.x > 520 && this.x<550) && (this.y < paddles[1].y+paddles[1].h && this.y > paddles[1].y-paddles[1].h/8))
            { //if the ball hits the cpu's paddle
                this.dx *= -1; //reverse direction in the x-axis
                document.querySelector('#bounce_sound').play(); //play a bouncing sound
                this.bounced = true; //change the recent bounce bool to be true
            }
            
            if(this.x-this.speed < 0)
            { //if the ball hits the user's wall
                this.dx *= 0; //stop the ball from moving in the x-axis
                this.dy *= 0; //stop the ball from moving in the y-axis
                document.querySelector('#score_sound').play(); //play a point scored sound
                this.score("user_score"); //update the user's score
            }
            
            if(this.x > field_width-this.size-this.speed)
            { //if the ball hits the cpu's wall
                this.dx *= 0; //stop the ball from moving in the x-axis
                this.dy *= 0; //stop the ball from moving in the y-axis
                document.querySelector('#score_sound').play(); //play a point scored sound
                this.score("cpu_score"); //update the cpu's score
            }
            
            if(this.y-this.speed < 0 || this.y > field_height - this.size-this.speed)
            { //if the ball hits the top or bottom of the playfield
                this.dy *= -1; //reverse the direction in the y-axis
            }
            
            $(`#${this.index}`).css("left", `${this.x}px`); //update the css for x-axis position of the ball
            $(`#${this.index}`).css("top", `${this.y}px`); //update the css for the y-axis position of the ball
            if (this.colored){$(`#${this.index}`).css("background", `rgb(${Math.floor(Math.random() * 255)},`+`${Math.floor(Math.random() * 255)},`+`${Math.floor(Math.random() * 255)})`);} //if the ball has a multicolor powerup, make it change color
            else{$(`#${this.index}`).css("background","white");} //if the ball does not have a multicolor power up, keep it white
        }
        
        score(side)
        { //function for if one side scores
            var score = $(`#${side}`).text(); //retrieve the score for the specified side
            score -= 1; //subtract one from the score
            $(`#${side}`).text(`${score}`); //update the score for the specified side
            if (score == 0)
            { //if one side has just lost (aka score is now 0)
                end_time = Date.now(); //record end time of game for use in highscores
                document.querySelector('#rainbow_sound').pause(); //pause the multicolor powerup sound in case it is still going
                while (balls.length > 0)
                { //while the list of balls is not empty
                    let ball = balls.pop(); //remove the last ball from the list of balls
                    $(`#${ball.index}`).remove(); //remove the ball from the html
                }
                
                while (powerups.length > 0)
                { //while the list of powerups is not empty
                    let powerup = powerups.pop(); //remove the last powerup from the list of powerups
                    $(`#${powerup.index}`).remove(); //remove the powerup from the html
                }
                
                if (side == "user_score")
                { //if the side that lost is the user
                    console.log("You Lose"); //let the console know the user lost
                    var cpu_wins = parseInt($("#cpu_wins").text()); //retrieve the cpu's win count
                    cpu_wins += 1; //add one to the win count
                    $("#cpu_wins").text(`${cpu_wins}`); //update the cpu's win count in the html
                }
                
                else
                { //if the side that lost is the cpu
                    console.log("You Win"); //let the console know the user won
                    var user_wins = parseInt($("#user_wins").text()); //retrieve the users's win count
                    user_wins += 1; //add one to the win count
                    $("#user_wins").text(`${user_wins}`); //update the user's win count in the html
                    get_highscores(); //update the highscores as necessary
                }

                newgame(); //reset the game to start a new game
                return 0;
            }
            
            else
            { //if neither side has lost yet, then reset ball to continue the game
                if (balls.length == 1)
                { //if there was only one ball left in the playfield
                    $(`#${this.index}`).remove(); //remove the last ball from the html
                    while (powerups.length > 0)
                    { //while the list of powerups is not empty
                        let powerup = powerups.pop(); //remove the last powerup from the list of powerups
                        $(`#${powerup.index}`).remove(); //remove the powerup from the html
                    }
                    
                    document.querySelector('#rainbow_sound').pause(); //pause the multicolor powerup sound in case it is still going
                    reset(); //reset the field to start a new point
                }
                
                else
                {//if there is still ultiple balls in the playfield
                    $(`#${this.index}`).remove(); //remove the ball that just scored from the html
                    balls.splice(balls.indexOf(this), 1); //remove the ball that just scored from the list of balls
                }   
            }
        }
    }
    
    
    function make_ball(x,y,size,speed,index)
    { //function to help create a new ball instance
        let ball = new Ball(x,y,size,speed,"ball"+index); //call ball class constructor
        ball_count += 1; //add one to the total count of balls
        $(`<div id=${ball.index}></div>`).appendTo("#playfield"); //adds new ball to html
        $(`#${ball.index}`).css( //adds initialized ball parameters to css
            {
                "width": `${ball.size}px`,
                "height": `${ball.size}px`,
                "text-align": "center",
                "font-size": "125%",
                "border-radius": "50%",
                "position": "absolute"    
            });
        balls.push(ball); //adds ball to the list of all balls
    }
    
    
    class Paddle
    { //class to construct and move paddles
        constructor(w, h, speed, name)
        { //function to initalize the paddles
            this.x = field_width - w*2; //starts the paddle in the middle of the playfield on the x-axis
            this.y = 0; 
            this.w = w; //sets the width of the paddle
            this.h = h; //sets the height of the paddle
            this.dx = 1;
            this.dy = 1;
            this.speed = speed;
            this.name = name;
        }
        
        move()
        { //function to move the pong ball around the screen
            if (this.name == "user_paddle")
            {
                $(document).mousemove(function(event)
                { //track the y-axis movement of the mouse 
                    if (event.pageY > field_height+(user_paddle_height/2))
                    { //if the mouse moves higher than the top of the screen
                        y = field_height-user_paddle_height; //keep the paddle at the top of the screen
                    }
                    else if (event.pageY < user_paddle_height+(user_paddle_height/2))
                    { //if the mouse moves lower than the bottom of the screen
                        y = 0; //keep the paddle at the bottom of the screen
                    }
                    else
                    { //otherwise while the mouse is moving, move the paddle with it
                        y = event.pageY-user_paddle_height-(user_paddle_height/2);
                    }
                });
                this.y = y;
            }
            else
            {
                this.y += this.dy * this.speed; //update ball's y-axis coordinate based om speed and direction
                if(this.y-this.speed < 0 || this.y > field_height - this.h-this.speed)
                { //if the ball hits the top or bottom of the screen
                    this.dy *= -1;
                } 
            }
    
            $(`#${this.name}`).css("top", `${this.y}px`);
        }
    }
    
    class Powerup
    {

        constructor(type, index)
        {
            this.x = field_width/2 - 10; //x-coordinate for ball
            this.y = Math.floor(Math.random() * (field_height-60)+30); //y-coordinate for ball
            this.speed = 1; //speed of ball
            this.dx = -1; //direction in x-axis
            this.dy = 0; //direction in y-axis
            this.type = type;
            this.index = index; //html index of ball
            console.log(type);
        }
        
        move()
        { 
            this.x += this.dx * this.speed; //update ball's x-axis coordinate based on speed and direction
            
            //if((this.x-this.speed < paddles[0].w*2 && this.x>paddles[0].w*1.25) && (this.y < paddles[0].y+paddles[0].h && this.y > paddles[0].y-paddles[0].h/2))
            if((this.x < 50 && this.x>20) && (this.y < paddles[0].y+paddles[0].h && this.y > paddles[0].y-paddles[0].h/2))
            { //if the ball hits the users wall
                if (this.type == "multiball") {this.multiball();}
                else if (this.type == "slowball") {this.slowball();}
                else if (this.type == "fastball") {this.fastball();}
                else if (this.type == "colorball") {this.colorball();}
            }
            
            if(this.x-this.speed < 0)
            { //if the ball hits the users wall
                this.remove();
            }
        
            $(`#${this.index}`).css("left", `${this.x}px`);
            $(`#${this.index}`).css("top", `${this.y}px`);
        }
        
        multiball()
        {
            balls.forEach((ball) =>
            {
                make_ball(ball.x,ball.y,ball.size,ball.speed,ball_count);
                make_ball(ball.x,ball.y,ball.size,ball.speed,ball_count);
            });
            this.remove();
        }
        
        slowball()
        {
            balls.forEach((ball) =>
            {
                ball.speed /= 2;
            });
            this.remove();
      
        }
        
        fastball()
        {
            balls.forEach((ball) =>
            {
                ball.speed += 2;
            });
            this.remove();
        }
        
        colorball()
        {

            if (balls[0].colored)
            {
                balls.forEach((ball) =>
                {
                    ball.colored = false;
                    if (ball.speed > 1)
                    {
                        ball.speed -= 1;
                    }
                });
                document.querySelector('#rainbow_sound').pause();
            }
            else
            {
                balls.forEach((ball) =>
                {
                    ball.colored = true;
                    ball.speed += 1;

                });
                document.querySelector('#rainbow_sound').play();
            }
            
            this.remove();
        }
        
        remove()
        {
            $(`#${this.index}`).remove();
            powerups.splice(powerups.indexOf(this), 1);
        }
    }
    
    function make_powerup(index)
    { //function to help create a new ball instance
        var chance = Math.floor(Math.random() * 3);
        if (chance == 0)
        {
            var typenum = Math.floor(Math.random() * 4);
            var type = types[typenum];
            let powerup = new Powerup(type, "powerup"+index); //call ball class constructor
            $(`<div id=${powerup.index}></div>`).appendTo("#playfield"); //adds new ball to html
            $(`#${powerup.index}`).css( //adds initialized ball parameters to css
                {
                    "width": `${20}px`,
                    "height": `${20}px`,
                    "background": "white",
                    "position": "absolute"    
                });
            $(`#${powerup.index}`).text("?");
            powerups.push(powerup); //adds ball to our list of all balls
            powerup_count += 1;
        }
        else{return 0;}
    }
    
    
    
    
    $("#ball").css("width", `${ball_size}px`);
    $("#ball").css("height", `${ball_size}px`);
    $("#ball").css("transform", `translateX(${ball_radius})`);
    $("#user_paddle").css("width", `${paddle_width}px`);
    $("#user_paddle").css("left", `${ball_size}px`);
    $("#cpu_paddle").css("width", `${paddle_width}px`);
    $("#cpu_paddle").css("right", `${ball_size}px`);
    $("#playfield").css("width", `${field_width}px`);
    $("#playfield").css("height", `${field_height}px`);
    
    set_highscores();
    let cpu_paddle = new Paddle(20, 200, 5, "cpu_paddle");
    let user_paddle = new Paddle(20, 100, 5, "user_paddle");
    paddles.push(user_paddle);
    paddles.push(cpu_paddle);


    function sleep(milliseconds)
    { //function to simulate pause on screen
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++)
        { //
            if ((new Date().getTime() - start) > milliseconds)
            { //if our current time - start time is more than the nuber of milliseconds we want to pause then we stop
                break;
            }
        }
    }
    
    
    function reset()
    { //upon scoring, reset the ball movement and position
        sleep(1500); //'pause' screen for 1.5 seconds
        ball_count = 0;
        powerup_count = 0;
        balls.pop();
        ball_y = Math.floor(Math.random() * (field_height-70)+30);
        make_ball(center[0],ball_y,30,5,ball_count);
    }
    

    
    function oneFrame()
    {
        balls.forEach((ball) =>
        {
            ball.move();    
        });
        powerups.forEach((powerup) =>
        {
            powerup.move();    
        });
        
        cpu_paddle.move();
        user_paddle.move();
        requestAnimationFrame(oneFrame);
    }
    
    function start()
    {
        $(document).on('click', 'button', function(event)
        {//function to begin events on click of start button
            event.preventDefault();
            $("#start").css("display", "none"); //make start button disapear after click
            $("#highscores").css("display", "none"); //make start button disapear after click

            $("#start").css("font-size", "150%"); //make start button disapear after click
            $("#start").text("play again");

            ball_y = Math.floor(Math.random() * (field_height-60)+30);

            make_ball(center[0],ball_y,30,5,ball_count);
            start_time = Date.now();

            requestAnimationFrame(oneFrame);
        });
    }
        
    function set_highscores()
    {
        for (var i = 1; i < 6; i++)
        {
            var current_highscore_name = "#highscore" + i;
            var current_highscore = localStorage.getItem(current_highscore_name);
            if (current_highscore != null)
            {
                $(`${current_highscore_name}`).text(`${current_highscore}`);
            }
        }
    }
    function get_highscores()
    {
        var score = (end_time - start_time)/1000;
        for (var i = 1; i < 6; i++)
        {
            var current_highscore_name = "#highscore" + i;
            var current_highscore = $(`${current_highscore_name}`).text();
            if (current_highscore != "none")
            {
                current_highscore = parseInt(current_highscore);
                if (score < current_highscore)
                {
                    $(`${current_highscore_name}`).text(`${score}`);
                    localStorage.setItem(current_highscore_name,score);
                    score = current_highscore;
                }
            }
            else
            {
                $(`${current_highscore_name}`).text(`${score}`);
                localStorage.setItem(current_highscore_name,score);

                return 0;

            }
        }
        
    }
    
    
    function newgame()
    {
        $(document).off('click');
        $("#start").css("display", "block"); //make start button disapear after click
        $("#highscores").css("display", "block"); //make start button disapear after click
        $(document).on('click', 'button', function(event)
        {//function to begin events on click of start button
            event.preventDefault();
            $("#start").css("display", "none"); //make start button disapear after click
            $("#highscores").css("display", "none"); //make start button disapear after click
            start_time = Date.now();
            
            ball_y = Math.floor(Math.random() * (field_height-60)+30);
            
            make_ball(center[0],ball_y,30,5,ball_count);
            $("#user_score").text("10");
            $("#cpu_score").text("10");

        });
        
    }
    start();

    
    
});