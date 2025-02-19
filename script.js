document.addEventListener('DOMContentLoaded', () => {
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');
    var balls = [];
    var selectedColor = null;
    const colors = ['red', 'yellow', 'black', 'white'];



    function resizeCanvas() {
        canvas.width = window.innerWidth-2;
        canvas.height = window.innerHeight;
        // Redraw the content if necessary
        //poolTable.calculateDimensions();   
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

let currentMode = 'draw'; // Default mode

document.getElementById('drawMode').addEventListener('click', () => {
    currentMode = 'draw';
    updateActiveModeUI();
});

document.getElementById('eraseMode').addEventListener('click', () => {
    currentMode = 'erase';
    updateActiveModeUI();
});

document.querySelectorAll('.colorMode').forEach(button => {
    button.addEventListener('click', function() {
        currentMode = 'color';
        selectedColor = this.getAttribute('data-color');
        updateActiveModeUI();
    });
});

function updateActiveModeUI() {
    // Reset all button styles
    document.querySelectorAll('#toolbar button').forEach(button => {
        button.classList.remove('active');
    });

    // Set active style for current mode
    switch (currentMode) {
        case 'draw':
            document.getElementById('drawMode').classList.add('active');
            break;
        case 'erase':
            document.getElementById('eraseMode').classList.add('active');
            break;
        case 'color':
            document.querySelectorAll('.colorMode').forEach(button => {
                if (button.getAttribute('data-color') === selectedColor) {
                    button.classList.add('active');
                }
            });
            break;
    }
}



class Ball {
    constructor(color, originalX, originalY) {
        this.originalX = originalX; // Store the original X position as a percentage
        this.originalY = originalY; // Store the original Y position as a percentage
        this.size = 50.8; // Original size
        this.color = color;
        this.lineEndX = this.originalX;
        this.lineEndY = this.originalY;
        this.line = false;
    }

    draw(scaledX, scaledY, scaledSize) {
        ctx.beginPath();
        this.scaledX = scaledX
        this.scaledY = scaledY
        this.scaledSize = scaledSize*this.size
        ctx.arc(scaledX, scaledY, (this.size*scaledSize)/2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        if (this.line){
        ctx.beginPath();
        ctx.setLineDash([10, 5]);
                // Set the stroke style to semi-transparent gray
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.9)'; // Gray color with 50% opacity
        ctx.lineWidth = 3;
        ctx.moveTo(this.scaledX, this.scaledY);
        ctx.lineTo(this.lineEndX, this.lineEndY);
        ctx.stroke();

        // Reset to default stroke style
        ctx.strokeStyle = 'black';
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        //ctx.stroke();
        }
    }

    drawWithShadow(scaledX, scaledY, scaledSize) {
        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Ball
        this.draw(scaledX, scaledY, scaledSize);

        // Reset shadow
        ctx.shadowColor = 'transparent';
    }
}
class PoolTable {
    constructor(ctx, playingAreaLength = 1829, playingAreaWidth = 914) {
        this.ctx = ctx;
        this.totalLength = 2113;
        this.totalWidth = 1197;
        this.pocketFactor = 0
        this.widthCushion = (990 - playingAreaWidth) / 2; // Cushion width
        this.lengthCushion = (1905 - playingAreaLength) / 2; // Cushion length
        this.playingAreaLength = playingAreaLength;
        this.playingAreaWidth = playingAreaWidth;
        this.frameWidth = (this.totalWidth - this.playingAreaWidth) / 2; // Width of the table frame
        this.frameLength = (this.totalLength - this.playingAreaLength) / 2;
        this.playingAreaRatio = this.totalWidth / this.totalLength;
        this.scaleFactor = 0;
        this.scaledLength = 0;
        this.scaledWidth = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        this.textureImg = new Image();
        this.textureImg.src = 'wood.JPG'; // Replace with the path to your texture image
    }
    calculateDimensions() {
        if (canvas.width / canvas.height < this.playingAreaRatio) {
            this.scaleFactor = canvas.width / this.totalWidth;
        } else {
            this.scaleFactor = (canvas.height - 40) / this.totalLength;
        }

        this.scaledLength = this.playingAreaLength * this.scaleFactor;
        this.scaledWidth = this.playingAreaWidth * this.scaleFactor;
        this.xOffset = (canvas.width - this.scaledWidth) / 2;
        this.yOffset = ((canvas.height) - this.scaledLength) / 2;

    }

    drawCushions() {
        const cushionColor = 'darkgreen';
        this.ctx.fillStyle = cushionColor;

        // Top and Bottom Cushions
        this.ctx.fillRect(this.xOffset, this.yOffset, this.scaledWidth, this.lengthCushion * this.scaleFactor);
        this.ctx.fillRect(this.xOffset, this.yOffset + this.scaledLength - this.lengthCushion * this.scaleFactor, this.scaledWidth, this.lengthCushion * this.scaleFactor);

        // Left and Right Cushions
        this.ctx.fillRect(this.xOffset, this.yOffset, this.widthCushion * this.scaleFactor, this.scaledLength);
        this.ctx.fillRect(this.xOffset + this.scaledWidth - this.widthCushion * this.scaleFactor, this.yOffset, this.widthCushion * this.scaleFactor, this.scaledLength);
    }

    drawPlayingArea() {
        const playingAreaX = this.xOffset + this.widthCushion * this.scaleFactor;
        const playingAreaY = this.yOffset + this.lengthCushion * this.scaleFactor;
        const width = this.playingAreaWidth * this.scaleFactor;
        const height = this.playingAreaLength * this.scaleFactor;

        // Base color
        this.ctx.fillStyle = 'green';

        this.ctx.fillRect(playingAreaX, playingAreaY, width, height);

        // Adding texture
        const textureDensity = 5000; // Number of dots, adjust for more/less density
        for (let i = 0; i < textureDensity; i++) {
            const x = playingAreaX + Math.random() * width;
            const y = playingAreaY + Math.random() * height;
            const dotSize = Math.random() * 2; // Random dot size for variety

            this.ctx.beginPath();
            this.ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 100, 0, ${Math.random()})`; // Varying shades of green
            this.ctx.fill();
        }
    }

    drawPockets() {
        const pocketColor = 'black';
        this.pocketRadius = (83.82/2) * this.scaleFactor; // Example pocket size, adjust as needed
        this.ctx.fillStyle = pocketColor;

        // Top pockets
        this.ctx.beginPath();
        this.ctx.arc(this.xOffset -(this.pocketFactor *this.scaleFactor), this.yOffset -(this.pocketFactor *this.scaleFactor), this.pocketRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(this.xOffset - (this.pocketFactor *4*this.scaleFactor) , this.yOffset + this.scaledLength / 2, this.pocketRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(this.xOffset + (this.pocketFactor *this.scaleFactor) + this.scaledWidth, this.yOffset -(this.pocketFactor *this.scaleFactor), this.pocketRadius, 0, 2 * Math.PI);
        this.ctx.fill();

        // Bottom pockets
        this.ctx.beginPath();
        this.ctx.arc(this.xOffset -(this.pocketFactor *this.scaleFactor), this.yOffset +(this.pocketFactor *this.scaleFactor) + this.scaledLength, this.pocketRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(this.xOffset +(this.pocketFactor *4*this.scaleFactor) + this.scaledWidth, this.yOffset  + this.scaledLength / 2, this.pocketRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(this.xOffset +(this.pocketFactor *this.scaleFactor) + this.scaledWidth, this.yOffset +(this.pocketFactor *this.scaleFactor) + this.scaledLength, this.pocketRadius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    drawCushionsWithCurves() {
        const cushionColor = 'darkgreen';
        const radius = this.widthCushion * this.scaleFactor*3.6;
        this.radDiff =  (this.widthCushion * this.scaleFactor) - radius;
        this.ctx.fillStyle = cushionColor;

        // Draw vertical cushions
        this.drawVerticalCushions(radius);

        // Draw horizontal cushions
        this.drawHorizontalCushions(radius);
    }

    drawVerticalCushions(radius) {
        const verticalShifts = [
            { x: 0, y: 0, angle: 1 },
            { x: 0, y: this.scaledLength / 2, angle: 1 },
            { x: this.scaledWidth, y: 0, angle: -1 },
            { x: this.scaledWidth, y: this.scaledLength / 2, angle: -1 }
        ];

        verticalShifts.forEach(shift => {
            const corner = this.calculateVerticalCornerCoordinates(radius, shift);
            this.drawCushionCorner(corner, shift,radius);
            this.drawCushionStraight(corner, shift);
        });
    }

    calculateVerticalCornerCoordinates(radius, shift) {
        return {
            xTop: this.xOffset + shift.x,
            yTop: this.yOffset - this.radDiff  + this.pocketRadius + shift.y,
            xBottom: this.xOffset + shift.x,
            yBottom: this.yOffset + this.radDiff  - this.pocketRadius + this.scaledLength / 2 + shift.y,
            width: this.widthCushion * this.scaleFactor,
            length: this.scaledLength / 2 + (this.radDiff  - this.pocketRadius) * 2
        };
    }

    drawHorizontalCushions(radius) {
        const horizontalShifts = [
            { x: 0, y: 0, angle: 1 },
            { x: 0, y: this.scaledLength, angle: -1 }
        ];

        horizontalShifts.forEach(shift => {
            const corner = this.calculateHorizontalCornerCoordinates(radius, shift);
            this.drawCushionCorner(corner, shift,radius, true);
            this.drawCushionStraight(corner, shift,radius, true);
        });
    }

    calculateHorizontalCornerCoordinates(radius, shift) {
        return {
            xLeft: this.xOffset - this.radDiff + this.pocketRadius + shift.x ,
            yLeft: this.yOffset + shift.y,
            xRight: this.xOffset + this.scaledWidth + this.radDiff - this.pocketRadius + shift.x,
            yRight: this.yOffset + shift.y,
            length: this.widthCushion * this.scaleFactor,
            width: this.scaledWidth + (this.radDiff - this.pocketRadius) * 2
        };
    }

    drawCushionCorner(corner, shift,radius, isHorizontal = false) {
        this.ctx.beginPath();
        if (isHorizontal) {

            let start = 0;
            let end = Math.PI;

            if (shift.angle == -1) {
                [start, end] = [end, start];
                this.rad = (Math.abs(this.radDiff))
            }
            else
            {this.rad = -1* Math.abs(this.radDiff)};

            this.ctx.arc(corner.xLeft, corner.yLeft+ (this.rad), radius, start, end);
            this.ctx.arc(corner.xRight, corner.yRight+ (this.rad), radius, start,end);
        } else {
            console.log( radius, radius)


            let start = (Math.PI / 2) * 3;
            let end =   (Math.PI / 2) * 5;

            if (shift.angle == -1) {
                [start, end] = [end, start];
                this.rad = (Math.abs(this.radDiff))
            }
            else
            {this.rad = -1* Math.abs(this.radDiff)};

            this.ctx.arc(corner.xTop+ (this.rad), corner.yTop, radius, start,end );
            this.ctx.arc(corner.xBottom+ (this.rad), corner.yBottom, radius, start,end);
        }
        this.ctx.fill();
    }

    drawCushionStraight(corner, shift,radius, isHorizontal = false) {
        if (isHorizontal) {
            this.ctx.fillRect(corner.xLeft, corner.yLeft, corner.width, corner.length * shift.angle);
        } else {
            this.ctx.fillRect(corner.xTop, corner.yTop, corner.width * shift.angle, corner.length);
        }
    }


    draw() {
        this.calculateDimensions();

        // Draw the frame of the table
        this.ctx.fillStyle = 'brown'; // color of the frame
        const scaledLength = this.totalLength * this.scaleFactor;
        const scaledWidth = this.totalWidth * this.scaleFactor;
        const xOffset = (canvas.width -scaledWidth) / 2;
        const yOffset = ((canvas.height) -scaledLength) / 2;

        // Draw the table background (playing area)
        const playingAreaX = this.xOffset //+ this.widthCushion * this.scaleFactor;
        const playingAreaY = this.yOffset //+ this.lengthCushion * this.scaleFactor;
        this.ctx.fillStyle = 'green'; // felt color
        //this.textureImg.onload = () => {
        //const pattern = ctx.createPattern(this.textureImg, 'repeat'); // 'repeat' can be changed to 'repeat-x', 'repeat-y', or 'no-repeat'

        // Use the pattern to fill shapes
        //this.ctx.fillStyle = pattern;

        // Example: Draw a rectangle filled with the texture
        //this.ctx.fillRect(playingAreaX, playingAreaY, this.playingAreaWidth * this.scaleFactor, this.playingAreaLength * this.scaleFactor); // Replace x, y, width, height with your values
    
        
        this.ctx.fillRect(playingAreaX, playingAreaY, this.playingAreaWidth * this.scaleFactor, this.playingAreaLength * this.scaleFactor);


        // Draw the cushions
        this.drawCushionsWithCurves();
        this.ctx.fillStyle = 'brown'; // color of the frame
        // Top frame
        this.ctx.fillRect(xOffset, yOffset, scaledWidth, this.frameLength * this.scaleFactor);

        // Bottom frame
        this.ctx.fillRect(xOffset, yOffset + scaledLength - this.frameLength * this.scaleFactor, scaledWidth, this.frameLength * this.scaleFactor);

        // Left frame
        this.ctx.fillRect(xOffset, yOffset, this.frameWidth * this.scaleFactor, scaledLength);

        // Right frame
        this.ctx.fillRect(xOffset + scaledWidth - this.frameWidth * this.scaleFactor, yOffset, this.frameWidth * this.scaleFactor, scaledLength);


        // Draw the pockets
        this.drawPockets();





    }
}

const poolTable = new PoolTable(ctx);
function drawPoolTable(ctx) {
    const playingAreaLength = 1829;
    const playingAreaWidth = 914;

    // Aspect ratio of the playing area
    const playingAreaRatio = playingAreaWidth / playingAreaLength;

    // Determine the scale factor based on the limiting dimension
    let scaleFactor;
    if (canvas.width / canvas.height < playingAreaRatio) {
        // Width is the limiting factor
        scaleFactor = canvas.width / playingAreaWidth;
    } else {
        // Height is the limiting factor (account for selection bar height)
        scaleFactor = (canvas.height - 40) / playingAreaLength;
    }

    // Calculate scaled dimensions
    const scaledLength = playingAreaLength * scaleFactor;
    const scaledWidth = playingAreaWidth * scaleFactor;

    // Calculate the position to center the table
    const xOffset = (canvas.width - scaledWidth) / 2;
    const yOffset = ((canvas.height - 40) - scaledLength) / 2 + 40;

    // Draw the table background (playing area)
    ctx.fillStyle = 'green'; // felt color
    ctx.fillRect(xOffset, yOffset, scaledWidth, scaledLength);

    // Calculate and draw the rails (optional)
    // ...

    // Add details like pockets, corner curves, etc., here
    // ...
}




    function drawSelectionBar() {
        colors.forEach((color, index) => {
            ctx.beginPath();
            ctx.arc(30 + 40 * index, 20, 10, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        });
    }

function addBall(x, y) {
    balls.forEach(ball => {
        if ((ball.scaledX + ball.scaledSize*1.5> x > ball.scaledX -ball.scaledSize*1.5)&&(ball.scaledY + ball.scaledSize*1.5> y > ball.scaledY -ball.scaledSize*1.5)){
            return;
        }})
    if (!isDragging && !dragStarted && selectedColor) {
    if (selectedColor && (x > poolTable.xOffset && x < poolTable.xOffset + poolTable.scaledWidth ) && (y > poolTable.yOffset && y < poolTable.yOffset + poolTable.scaledLength)) {
        const originalX = (x - poolTable.xOffset) / poolTable.scaledWidth; // Percentage of the width
        const originalY = (y - poolTable.yOffset) / poolTable.scaledLength; // Percentage of the length
        balls.push(new Ball(selectedColor, originalX, originalY));
    }}
}

let draggedBall = null;
let isDragging = false;


function calculateLineReflection(ball, mouseX, mouseY) {
    // Direction from ball to mouse
    let dx = mouseX - ball.scaledX;
    let dy = mouseY - ball.scaledY;

    // Calculate where the line intersects with table boundaries
    // This is a simplified example and assumes straight line reflection
    // For more complex physics, consider using a physics engine
    let reflectionX = ball.scaledX - dx;
    let reflectionY = ball.scaledY - dy;

    // Check for boundary intersections and adjust
    // Horizontal boundary
    if (reflectionX < poolTable.xOffset || reflectionX > poolTable.xOffset + poolTable.scaledWidth) {
        reflectionX = clamp(reflectionX, poolTable.xOffset, poolTable.xOffset + poolTable.scaledWidth);
    }
    // Vertical boundary
    if (reflectionY < poolTable.yOffset || reflectionY > poolTable.yOffset + poolTable.scaledLength) {
        reflectionY = clamp(reflectionY, poolTable.yOffset, poolTable.yOffset + poolTable.scaledLength);
    }

    // Store the reflection end point
    ball.lineEndX = reflectionX;
    ball.lineEndY = reflectionY;
}




function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}




function adjustBallPosition(ball) {
    const leftBound = poolTable.xOffset + poolTable.widthCushion * poolTable.scaleFactor;
    const rightBound = poolTable.xOffset + poolTable.scaledWidth - poolTable.widthCushion * poolTable.scaleFactor;
    const topBound = poolTable.yOffset + poolTable.lengthCushion * poolTable.scaleFactor;
    const bottomBound = poolTable.yOffset + poolTable.scaledLength - poolTable.lengthCushion * poolTable.scaleFactor;
    const radius = ball.size * poolTable.scaleFactor / 2;

    // Adjust for left boundary
    if (ball.scaledX - radius < leftBound) {
        ball.originalX = (leftBound + radius - poolTable.xOffset) / poolTable.scaledWidth;
    }

    // Adjust for right boundary
    if (ball.scaledX + radius > rightBound) {
        ball.originalX = (rightBound - radius - poolTable.xOffset) / poolTable.scaledWidth;
    }

    // Adjust for top boundary
    if (ball.scaledY - radius < topBound) {
        ball.originalY = (topBound + radius - poolTable.yOffset) / poolTable.scaledLength;
    }

    // Adjust for bottom boundary
    if (ball.scaledY + radius > bottomBound) {
        ball.originalY = (bottomBound - radius - poolTable.yOffset) / poolTable.scaledLength;
    }
}


canvas.addEventListener('mouseup', () => {
    if (isDragging) {
        draggedBall = null;
    }
});

let hoverIndex = null;
const ballSizes = new Array(colors.length).fill(10); // Initial size of balls
const maxBallSize = 15; // Maximum size when hovered
const growthRate = 0.5; // How fast the ball grows/shrinks

function drawSelectionBar() {
    // Draw the background of the selection bar
    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.fillRect(0, 0, 40,canvas.height); // Adjust to fit larger balls

    colors.forEach((color, index) => {
        let size = ballSizes[index];

        // Animate the growth/shrink of the ball
        if (hoverIndex === index && size < maxBallSize) {
            ballSizes[index] = size + growthRate;
        } else if (hoverIndex !== index && size > 10) {
            ballSizes[index] = size - growthRate;
        }

        // Draw colored balls
        ctx.beginPath();
        ctx.arc(20,30 + 40 * index,  ballSizes[index], 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();
    });
}

function drawBalls() {
    balls.forEach(ball => {
        // Calculate the scaled position and size
        const scaledX = poolTable.xOffset + ball.originalX * poolTable.scaledWidth;
        const scaledY = poolTable.yOffset + ball.originalY * poolTable.scaledLength;
        const scaledSize = ball.size * poolTable.scaleFactor; // Scale the size of the ball

        ball.drawWithShadow(scaledX, scaledY, poolTable.scaleFactor);
    });
}

function eraseBall(x, y) {
    console.log("in erase")
    for (let i = 0; i < balls.length; i++) {
        const distance = Math.sqrt(Math.pow(x - balls[i].scaledX, 2) + Math.pow(y - balls[i].scaledY, 2));
        if (distance < balls[i].scaledSize / 2) {
            balls.splice(i, 1); // Remove the ball from the array
            break; // Exit the loop after finding the ball to erase
        }
    }
}

function ballsCollide(ball1, ball2) {
    const dx = ball1.scaledX - ball2.scaledX;
    const dy = ball1.scaledY - ball2.scaledY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < ball1.scaledSize / 2 + ball2.scaledSize / 2;
}

function ballHitsBoundary(ball) {
    const leftBound = poolTable.xOffset + poolTable.widthCushion * poolTable.scaleFactor;
    const rightBound = poolTable.xOffset + poolTable.scaledWidth - poolTable.widthCushion * poolTable.scaleFactor;
    const topBound = poolTable.yOffset + poolTable.lengthCushion * poolTable.scaleFactor;
    const bottomBound = poolTable.yOffset + poolTable.scaledLength - poolTable.lengthCushion * poolTable.scaleFactor;

    return (
        ball.scaledX - ball.size / 2 < leftBound ||
        ball.scaledX + ball.size / 2 > rightBound ||
        ball.scaledY - ball.size / 2 < topBound ||
        ball.scaledY + ball.size / 2 > bottomBound
    );
}

function coordsHitsBoundary(X,Y,size) {
    const leftBound = poolTable.xOffset + poolTable.widthCushion * poolTable.scaleFactor;
    const rightBound = poolTable.xOffset + poolTable.scaledWidth - poolTable.widthCushion * poolTable.scaleFactor;
    const topBound = poolTable.yOffset + poolTable.lengthCushion * poolTable.scaleFactor;
    const bottomBound = poolTable.yOffset + poolTable.scaledLength - poolTable.lengthCushion * poolTable.scaleFactor;

    return (
        X < leftBound ||
        X  > rightBound ||
        Y  < topBound ||
        Y  > bottomBound
    );
}

//function setBallBoundry(ball,scaledX,scaledY) {
//    const leftBound = poolTable.xOffset + poolTable.widthCushion * poolTable.scaleFactor;
 //   const rightBound = poolTable.xOffset + poolTable.scaledWidth - poolTable.widthCushion * poolTable.scaleFactor;
//    const topBound = poolTable.yOffset + poolTable.lengthCushion * poolTable.scaleFactor;
//    const bottomBound = poolTable.yOffset + poolTable.scaledLength - poolTable.lengthCushion * poolTable.scaleFactor;
//    Math.min(scaledX,ball.size / 2 + leftBound);
//    Math.max(scaledX,rightBound - ball.size / 2 );
//    Math.min(scaledY,ball.size / 2 + topBound);
//    Math.max(scaledy,bottomBound - ball.size / 2);
    
canvas.addEventListener('click', handleClick);
canvas.addEventListener('touchend', function(event) {
    if (event.touches.length === 0) { // Ensure it's a tap, not the end of a drag
        handleClick(event.changedTouches[0]);
    }
});

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (event.type === 'touchend') {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    } else {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    }
    // Continue with your existing logic...
}


canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    hoverIndex = null;

    if (x <= 40) {
        const index = Math.floor((y - 20) / 40);
        if (index >= 0 && index < colors.length) {
            hoverIndex = index;
        }
    }
});

// Update the hover effect
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    hoverIndex = null; // Reset hover index

    if (x <= 40) { // Check if the mouse is in the selection bar area
        const index = Math.floor((y - 20) / 40);
        if (index >= 0 && index < colors.length) {
            hoverIndex = index;
        }
    }
});


canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    balls.forEach(ball => {
        const distance = Math.sqrt((x - ball.scaledX) ** 2 + (y - ball.scaledY) ** 2);
        console.log(x, ball.scaledX, y,ball.scaledY)
        if (distance < ball.scaledSize) {
            draggedBall = ball;
            isDragging = true;
        }
    });
});

canvas.addEventListener('mousemove', (event) => {


    if (draggedBall && isDragging) {
        const rect = canvas.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;

        // Calculate new position
        //
        //
        const tempX= (x - poolTable.xOffset) / poolTable.scaledWidth;
        //
        const tempY = (y - poolTable.yOffset) / poolTable.scaledLength;
 
        console.log(x,y)
        if (!coordsHitsBoundary(x,y,draggedBall.size)) {
            draggedBall.originalX = tempX
            draggedBall.originalY =tempY//}
            adjustBallPosition(draggedBall);

        // Check for collisions with boundaries
        if (ballHitsBoundary(draggedBall)) {
            adjustBallPosition(draggedBall);
        }
        // Check for collisions with other balls
        balls.forEach(ball => {
            if (ball !== draggedBall && ballsCollide(draggedBall, ball)) {
            const dx = ball.scaledX - draggedBall.scaledX;
        const dy = ball.scaledY - draggedBall.scaledY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const overlap = (draggedBall.scaledSize / 2 + ball.scaledSize / 2) - distance;

        if (distance !== 0) { // Avoid division by zero
            const adjustX = (dx / distance) * overlap;
            const adjustY = (dy / distance) * overlap;

            ball.originalX += adjustX / poolTable.scaledWidth;
            ball.originalY += adjustY / poolTable.scaledLength;
            if (ballHitsBoundary(ball)) {
                adjustBallPosition(ball);
        }}
        }});


    }}
  
});


//Line Drawing

let isDrawingLine = false;
let lineStartX = 0;
let lineStartY = 0;
let lines = []; // Array to hold arrays of line segments
let currentLine = []; // Currently being drawn line


canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('touchstart', startDrawing, { passive: false });

canvas.addEventListener('mousemove', drawLine);
canvas.addEventListener('touchmove', drawLine, { passive: false });

function startDrawing(event) {
    if (currentMode !== 'draw') return;

    event.preventDefault();
    const { x, y } = getEventCoordinates(event);

    isDrawingLine = true;
    currentLine = [{ x, y }]; // Start a new line with the initial point
}

function drawLine(event) {
    if (!isDrawingLine || currentMode !== 'draw') return;

    event.preventDefault();
    const { x, y } = getEventCoordinates(event);

    currentLine.push({ x, y }); // Add point to the current line

    // Redraw only the last segment for efficiency
    ctx.beginPath();
    ctx.moveTo(currentLine[currentLine.length - 2].x, currentLine[currentLine.length - 2].y);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function endDrawing() {
    if (currentMode !== 'draw') return;
    if (currentLine.length > 1) { // Only add lines with more than one point
        lines.push(currentLine);
    }
    isDrawingLine = false;
    currentLine = [];
}

canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('touchend', endDrawing, { passive: false });





canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('touchend', endDrawing, { passive: false });


function getEventCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (event.touches) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
    } else {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    }
    return { x, y };
}





let isDraggingLine = false;
let selectedBall = null;



canvas.addEventListener('mousemove', (event) => {

        if (isDraggingLine && selectedBall) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Calculate the reflection of the line
        calculateLineReflection(selectedBall, mouseX, mouseY);
    }
});

canvas.addEventListener('mouseup', () => {
    if (isDraggingLine) {
        isDraggingLine = false;
        selectedBall = null;
    }
});

let dragStarted = false;

canvas.addEventListener('touchstart', (event) => {
    event.preventDefault(); // Prevent scrolling
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    balls.forEach(ball => {
        const distance = Math.sqrt((x - ball.scaledX) ** 2 + (y - ball.scaledY) ** 2);
        if (distance < ball.scaledSize) {
            draggedBall = ball;
            isDragging = true;
        }
    });
}, { passive: false }); // Use passive: false to ensure the touch event doesn't get treated as passive.


canvas.addEventListener('touchmove', (event) => {
    if (draggedBall) {
        if (!dragStarted) {
            dragStarted = true; // Mark that dragging has started
        }}
        isDragging = true;

    if (draggedBall && isDragging) {
        event.preventDefault(); // Prevent scrolling
        const touch = event.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        const tempX = (x - poolTable.xOffset) / poolTable.scaledWidth;
        const tempY = (y - poolTable.yOffset) / poolTable.scaledLength;

        if (!coordsHitsBoundary(x, y, draggedBall.size)) {
            draggedBall.originalX = tempX;
            draggedBall.originalY = tempY;
            adjustBallPosition(draggedBall);
        }

        // Check for collisions with boundaries
        if (ballHitsBoundary(draggedBall)) {
            adjustBallPosition(draggedBall);
        }

        // Check for collisions with other balls
        balls.forEach(ball => {
            if (ball !== draggedBall && ballsCollide(draggedBall, ball)) {
                const dx = ball.scaledX - draggedBall.scaledX;
                const dy = ball.scaledY - draggedBall.scaledY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const overlap = (draggedBall.scaledSize / 2 + ball.scaledSize / 2) - distance;

                if (distance !== 0) { // Avoid division by zero
                    const adjustX = (dx / distance) * overlap;
                    const adjustY = (dy / distance) * overlap;

                    ball.originalX += adjustX / poolTable.scaledWidth;
                    ball.originalY += adjustY / poolTable.scaledLength;
                    if (ballHitsBoundary(ball)) {
                        adjustBallPosition(ball);
                    }
                }
            }
        });
    }
}, { passive: false });

canvas.addEventListener('touchend', () => {
        setTimeout(() => { // Delay to differentiate between drag end and tap
        isDragging = false;
        dragStarted = false;
    }, 100); 
    isDragging = false;
    draggedBall = null;
    if (isDraggingLine) {
        isDraggingLine = false;
        selectedBall = null;
    }
}, { passive: false });



// Consolidate click and touchend handling into a single function
function handleClickOrTouch(event) {
        // Skip if in drawing mode
    if (currentMode === 'draw') return;

    // Determine if this is a touch event and prevent default if it is
    const isTouch = event.type.startsWith('touch');
    if (isTouch) {
        event.preventDefault(); // Prevent default touch behavior (scrolling, zooming, etc.)
    }

    // Get the correct x and y coordinates based on the event type
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (isTouch) {
        // Use the first touch point for touch events
        const touch = event.changedTouches[0];
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
    } else {
        // Use clientX and clientY directly for mouse events
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    }

    // The logic for adding a ball or selecting from the color bar
    if (x <= 40) { // Selection bar logic
        const index = Math.floor((y - 20) / 40);
        if (index >= 0 && index < colors.length && !isDragging) {
            selectedColor = colors[index];
        }
    } else if (selectedColor && !isDragging) {
        console.log(currentMode)
        if (currentMode != 'erase'){
            addBall(x, y);
        }


        }
    if (currentMode == 'erase'){
    eraseBallOrLine(x, y);
}
    isDragging = false; // Reset dragging state after handling click/touch
}


function isPointNearLine(clickX, clickY, line, tolerance = 10) {
    for (let i = 0; i < line.length - 1; i++) {
        const start = line[i];
        const end = line[i + 1];
        const dist = distanceToLineSegment(clickX, clickY, start.x, start.y, end.x, end.y);
        if (dist < tolerance) {
            return true;
        }
    }
    return false;
}

function distanceToLineSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) {
        param = dot / len_sq;
    }

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}


function eraseBallOrLine(x, y) {
    if (currentMode === 'erase') {
        // Check for erasing balls
        for (let i = 0; i < balls.length; i++) {
            const dist = Math.sqrt(Math.pow(x - balls[i].scaledX, 2) + Math.pow(y - balls[i].scaledY, 2));
            if (dist < balls[i].scaledSize / 2) {
                balls.splice(i, 1); // Remove the ball if clicked on
                return; // Stop checking if a ball is erased
            }
        }

        // Check for erasing lines
        for (let i = lines.length - 1; i >= 0; i--) {
            if (isPointNearLine(x, y, lines[i])) {
                lines.splice(i, 1); // Remove the line if clicked near
                break; // Stop checking after erasing a line
            }
        }
    }
}








// Listen for clicks and touch ends to add balls or select colors
canvas.addEventListener('click', handleClickOrTouch);
canvas.addEventListener('touchend', handleClickOrTouch, { passive: false });

// Remove the redundant click event listener that's directly adding balls
poolTable.draw();

function redrawLines() {
    lines.forEach(line => {
        ctx.beginPath();
        ctx.strokeStyle = "lightgray"; // Use selectedColor for the line color
        ctx.lineWidth = 5; // Example line width
        ctx.lineCap = 'round'; // Round ends for smoother lines
        ctx.moveTo(line[0].x, line[0].y);
        for (let i = 1; i < line.length; i++) {
            ctx.lineTo(line[i].x, line[i].y);
        }
        ctx.stroke();
    });
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    poolTable.draw();
    redrawLines(); // Redraw all lines

    drawBalls();
}

    animate();
});