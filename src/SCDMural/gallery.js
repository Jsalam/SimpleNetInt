class Gallery {
    /**
     * 
     * @param {*} _x origin left
     * @param {*} _y origin top
     * @param {*} _scale factor to scale up the drawing. At 7.5 scale, 6 drawing units correspond to 1 foot, 0.5 drawing units to 1 inch.
     */

    constructor(_x, _y, _scale) {
        this.x = _x;
        this.y = _y;
        this.scale = _scale;
        this.colWeight = .125;
        this.wallWeight = .25;
        this.canvasWeight = 0.5;
    }

    //COLUMNS
    column(renderer) {
        renderer.fill(255, 130)
        renderer.stroke(0);
        renderer.strokeWeight(this.colWeight * this.scale);
        renderer.rect(this.x - 219 * this.scale, this.y - 60 * this.scale, 6 * this.scale, 120 * this.scale);
        renderer.rect(this.x - 75 * this.scale, this.y - 60 * this.scale, 6 * this.scale, 120 * this.scale);
        renderer.rect(this.x + 116.5 * this.scale, this.y - 60 * this.scale, 6 * this.scale, 120 * this.scale);
        renderer.rect(this.x + 308.5 * this.scale, this.y - 60 * this.scale, 6 * this.scale, 120 * this.scale);
    }

    //WALL
    wall(renderer) {
        renderer.strokeWeight(this.wallWeight * this.scale);
        renderer.noFill();
        renderer.stroke(0);
        renderer.line(this.x - 336 * this.scale, this.y - 60 * this.scale, this.x + 336 * this.scale, this.y - 60 * this.scale);
        renderer.line(this.x + 336 * this.scale, this.y - 60 * this.scale, this.x + 336 * this.scale, this.y + 60 * this.scale);
        renderer.line(this.x + 336 * this.scale, this.y + 60 * this.scale, this.x + 192 * this.scale, this.y + 60 * this.scale);
        renderer.line(this.x + 192 * this.scale, this.y + 60 * this.scale, this.x + 192 * this.scale, this.y - 12 * this.scale);
        renderer.line(this.x + 192 * this.scale, this.y - 12 * this.scale, this.x + 144 * this.scale, this.y - 12 * this.scale);
        renderer.line(this.x + 144 * this.scale, this.y - 12 * this.scale, this.x + 144 * this.scale, this.y + 60 * this.scale);
        renderer.line(this.x + 144 * this.scale, this.y + 60 * this.scale, this.x - 240 * this.scale, this.y + 60 * this.scale);
        renderer.line(this.x - 240 * this.scale, this.y + 60 * this.scale, this.x - 240 * this.scale, this.y - 12 * this.scale);
        renderer.line(this.x - 240 * this.scale, this.y - 12 * this.scale, this.x - 288 * this.scale, this.y - 12 * this.scale);
        renderer.line(this.x - 288 * this.scale, this.y - 12 * this.scale, this.x - 288 * this.scale, this.y + 60 * this.scale);
        renderer.line(this.x - 288 * this.scale, this.y + 60 * this.scale, this.x - 336 * this.scale, this.y + 60 * this.scale);
        renderer.line(this.x - 336 * this.scale, this.y + 60 * this.scale, this.x - 336 * this.scale, this.y - 60 * this.scale);
    }

    //CANVAS
    canvas(renderer) {
        renderer.strokeWeight(this.canvasWeight * this.scale);
        renderer.noFill();
        renderer.stroke(0, 60);
        renderer.rect(this.x - 228 * this.scale, this.y - 12 * this.scale, 360 * this.scale, 60 * this.scale);
        renderer.rect(this.x + 204 * this.scale, this.y - 12 * this.scale, 120 * this.scale, 60 * this.scale);
    }

    //HOT AREA
    /** This is the most visisble area on the wall from close proximity
     * It goes from 44 inches height to 74 inches.
     */

    hotArea(renderer) {
        renderer.strokeWeight(this.colWeight * this.scale);
        renderer.noFill();
        renderer.stroke(255, 0, 0);
        renderer.rect(this.x - 210 * this.scale, this.y + 23.2 * this.scale, 324 * this.scale, 18 * this.scale);
    }


}