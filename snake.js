function SnakeTheGame() {
    this.cols = 30;
    this.rows = 20;
    this.elField = document.querySelector('.field');
    this.pixels = [];
    this.target = [9, 15];
    this.hero = [];
    this.heroInitLength = 4;
    this.dir = 0; // up, right, down, left
    this.timer = 0;
    this.interval = 250;

    let touchX = null;
    let touchY = null;
    let touchZ = null;

    this.init = function () {

        if (window.innerWidth < 480) {
            let bodyMargins = 9;
            let pixelWidth = 5;
            let maxWidth = window.innerWidth - bodyMargins / 2;
            let maxCols = maxWidth / pixelWidth;
            console.log('maxWidth', maxWidth, 'maxCols', maxCols);
        }
        // make empty field
        for (var i = 0; i < this.rows; i++) {
            let row = document.createElement('div');
            row.className = 'row';
            this.elField.append(row);
            let rowPixels = [];
            for (let j = 0; j < this.cols; j++) {
                let cell = document.createElement('div');
                cell.className = 'pixel';
                row.append(cell);
                rowPixels.push(cell);
            }
            this.pixels.push(rowPixels);
        }
    }
    this.render = function () {
        for (let rowPixels of this.pixels) {
            for (let pixel of rowPixels) {
                pixel.className = 'pixel';
            }
        }
        // target
        let [tx, ty] = this.target;
        this.pixels[ty][tx].classList.add('apple');
        // hero
        for (let i in this.hero) {
            let [x, y] = this.hero[i];
            let px = this.pixels[y][x];
            let type = (i == 0) ? 'head' : 'body';
            px.classList.add(type);
        }
    }
    this.placeTarget = function () {
        let x = getRandomInt(0, this.cols - 1);
        let y = getRandomInt(0, this.rows - 1);
        this.target = [x, y];
        this.render();
    }
    this.initHero = function () {
        this.hero = [];
        let headX = Math.floor(this.cols / 2);
        if (this.target[0] == headX) headX++;
        let headY = Math.floor(this.rows / 2);
        this.hero.push([headX, headY]);
        for (let l = 1; l < this.heroInitLength; l++) {
            this.hero.push([headX, ++headY])
        }
    }
    this.moveHero = function () {
        let next;
        let grow = false;
        let head = this.hero[0];
        let [hx, hy] = head;
        switch (this.dir) {
            case 0: next = [hx, hy - 1]; break;
            case 1: next = [hx + 1, hy]; break;
            case 2: next = [hx, hy + 1]; break;
            case 3: next = [hx - 1, hy]; break;
        }
        if (next[0] < 0) next[0] = this.cols - 1;
        if (next[1] < 0) next[1] = this.rows - 1;
        if (next[0] > this.cols - 1) next[0] = 0;
        if (next[1] > this.rows - 1) next[1] = 0;
        // grow
        // next[0] == this.target[0] && next[1] == this.target[1]
        if (`${next}` == `${this.target}`) {
            grow = true;
        }

        // gameover
        for (let part of this.hero) {
            if (`${part}` == `${next}`) {
                clearInterval(this.timer);
                this.initHero();
                this.render();
                return;
            }
        }

        this.hero.unshift(next);
        if (grow == false) this.hero.pop();
        if (grow == true) this.placeTarget();

        this.render();
    }
    this.handleKeyboard = function (e) {
        if (this.timer) clearInterval(this.timer);
        // console.log(e);
        let keyCodes = [38, 39, 40, 37];
        let newDirection = keyCodes.indexOf(e.keyCode);
        if (newDirection < 0) return;
        if (
            this.dir != newDirection &&
            (this.dir % 2) == (newDirection % 2)
        ) return;
        this.dir = newDirection;
        e.preventDefault();
        // console.log('newDirection', newDirection)
        this.moveHero();
        this.timer = setInterval(this.moveHero.bind(this), this.interval);
    }
    this.bindKeyboard = function () {
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }

    this.bindTouchDevices = () => {
        this.elField.addEventListener('touchstart', this.touchStartHandler.bind(this));
        this.elField.addEventListener('touchmove', this.touchMoveHandler.bind(this));
        this.elField.addEventListener('touchend', this.touchEndHandler.bind(this));
    }

    this.touchStartHandler = (e) => {
        // console.log(e);
        let touch = e.touches[0];
        // console.log(touch)
        touchX = touch.clientX;
        touchY = touch.clientY;
    }
    this.touchMoveHandler = (e) => {
        e.preventDefault();
        if (touchZ) return;
        // console.log(e);
        let maxDelta = 30;
        let touch = e.touches[0];
        let deltaX = touch.clientX - touchX;
        let deltaY = touch.clientY - touchY;
        if (Math.abs(deltaX) > maxDelta || Math.abs(deltaY) > maxDelta) {
            // [38, 39, 40, 37]
            let direction = (Math.abs(deltaX) > Math.abs(deltaY)) ?
                ((deltaX < 0) ? 37 : 39) : ((deltaY < 0) ? 38 : 40);
            // ((deltaX < 0) ? 'left' : 'right') : ((deltaY < 0) ? 'up' : 'down')
            touchZ = true;
            console.log(direction);
            let fakeEvent = new Event('keydown');
            fakeEvent.keyCode = direction;
            this.handleKeyboard(fakeEvent);
            // console.log(deltaX, deltaY);
        }

    }
    this.touchEndHandler = (e) => {
        touchZ = false;
    }

    this.init();
    this.bindKeyboard();
    this.bindTouchDevices();
    this.placeTarget();
    this.initHero();
    this.render();
}

document.addEventListener('DOMContentLoaded', function () {
    game = new SnakeTheGame();
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}