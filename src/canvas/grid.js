/** Class for adding a grid on top of the canvas */
class Grid {
    /**
     * 
     * @param {vector} org vector with origin coordinate system
     * @param {numerci} width width in output units
     * @param {numeric} height height in output units
     * @param {numeric} hPartitions number of steps
     * @param {numeric} vPartitions number of steps
     * @param {numeric} scaleFactor the cell width or height representing an output unit scale. E.g., scaleFactor = 100 at width=50 meters and step=5 meter means that 100 pixels represent 10 meters (50/5) output units
     */
    constructor(org, width, height, hPartitions, vPartitions, scaleFactor) {
        this.org = org;
        this.width = width * scaleFactor;
        this.height = height * scaleFactor;
        this.hStep = this.width / hPartitions;
        this.vStep = this.height / vPartitions;
        this.stroke = '#ffffff33';

        // this is used to scale the grid to represent actual output units
        this.scaleFactor = scaleFactor;
        this.visible = true;
    }

    show(renderer) {
        if (this.visible) {
            renderer.strokeWeight(1);
            renderer.stroke(this.stroke);
            renderer.fill(this.stroke);
            renderer.textSize(10);
            renderer.textAlign(gp5.CENTER, gp5.CENTER);

            // vertical lines
            for (let i = 0; i < this.width + 1; i += this.hStep) {
                const x = this.org.x + i;
                renderer.line(x, this.org.y, x, this.org.y - this.height);
                renderer.text(i / this.scaleFactor, x, this.org.y);
            }
            // horizontal lines
            for (let i = 0; i < this.height + 1; i += this.vStep) {
                const y = this.org.y - i;
                renderer.line(this.org.x, y, this.org.x + this.width, y);
                renderer.text(i / this.scaleFactor, this.org.x + 12, y);
            }
            //this.showScale(renderer, gp5.width - 500, 25);
        }
    }

    showScale(renderer, x, y) {
        // areas
        renderer.strokeWeight(0.5);
        renderer.noFill();
        renderer.stroke('#00000033');
        renderer.rect(x, y, this.hStep, this.vStep);
        const meter = this._meterToFeet();
        renderer.rect(x, y + 12, meter, meter);

        // bars
        renderer.strokeWeight(2);
        renderer.stroke('#00000099');
        renderer.line(x, y, x + this.hStep, y);
        renderer.line(x, y + 12, x + meter, y + 12);

        // texts
        renderer.noStroke();
        renderer.fill("#000000");
        renderer.textAlign(gp5.LEFT);
        renderer.text('0', x - 8, y);
        renderer.text('0', x - 8, y + 12);
        renderer.text('1 foot', x + this.hStep + 3, y);
        renderer.text('1 m', x + meter + 3, y + 12);

    }

    _feetToMeters(val) {
        const factor = 3.28084
        return val / factor
    }

    _meterToFeet() {
        const factor = 3.28084
        return this.hStep * factor;
    }

    _inchesToCentimeters(val) {
        const factor = 0.393701
        return val / factor
    }

}