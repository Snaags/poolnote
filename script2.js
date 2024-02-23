document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const balls = [];
    let selectedColor = null;
    const colors = ['red', 'yellow', 'black', 'white'];

    function resizeCanvas() {
        canvas.width = window.innerWidth - 30;
        canvas.height = window.innerHeight - 30;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Ball {
        constructor(color, originalX, originalY) {
            this.originalX = originalX;
            this.originalY = originalY;
            this.size = 50.8;
            this.color = color;
        }

        draw(scaledX, scaledY, scaledSize) {
            ctx.beginPath();
            ctx.arc(scaledX, scaledY, this.size * scaledSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        drawWithShadow(scaledX, scaledY, scaledSize) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            this.draw(scaledX, scaledY, scaledSize);
            ctx.shadowColor = 'transparent';
        }
    }

    // PoolTable class definition (no changes needed)
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

    function drawSelectionBar() {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.fillRect(0, 0, 40, canvas.height);

        colors.forEach((color, index) => {
            const size = ballSizes[index];
            ctx.beginPath();
            ctx.arc(20, 30 + 40 * index, size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.stroke();
        });
    }

    function addBall(x, y) {
        if (selectedColor && x <= 40 && y > 20 && y < 20 + 40 * colors.length) {
            const originalX = (x - poolTable.xOffset) / poolTable.scaledWidth;
            const originalY = (y - poolTable.yOffset) / poolTable.scaledLength;
            balls.push(new Ball(selectedColor, originalX, originalY));
        }
    }

    let draggedBall = null;
    let isDragging = false;

    canvas.addEventListener('mousedown', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        balls.forEach(ball => {
            const distance = Math.sqrt((x - ball.scaledX) ** 2 + (y - ball.scaledY) ** 2);
            if (distance < ball.scaledSize) {
                draggedBall = ball;
                isDragging = true;
            }
        });
    });

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (x <= 40) {
            const index = Math.floor((y - 20) / 40);
            hoverIndex = (index >= 0 && index < colors.length) ? index : null;
        } else {
            hoverIndex = null;
        }

        if (draggedBall && isDragging) {
            draggedBall.originalX = (x - poolTable.xOffset) / poolTable.scaledWidth;
            draggedBall.originalY = (y - poolTable.yOffset) / poolTable.scaledLength;
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (isDragging) {
            draggedBall = null;
            isDragging = false;
        }
    });

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (!isDragging) {
            addBall(x, y);
        }
    });

    let hoverIndex = null;
    const ballSizes = new Array(colors.length).fill(10); // Initial size of balls
    const maxBallSize = 15; // Maximum size when hovered
    const growthRate = 0.5; // How fast the ball grows/shrinks

    function drawBalls() {
        balls.forEach(ball => {
            const scaledX = poolTable.xOffset + ball.originalX * poolTable.scaledWidth;
            const scaledY = poolTable.yOffset + ball.originalY * poolTable.scaledLength;
            ball.drawWithShadow(scaledX, scaledY, poolTable.scaleFactor);
        });
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        poolTable.draw();
        drawSelectionBar();
        drawBalls();
    }

    animate();
});
