class Chord {
    constructor(frets, pos, arm) {
        this.points = [];
        this.arm = arm;
        // this.points.push(frets[0].vertices[pos]);
        for (let i = 1; i < frets.length; i++) {
            let pVrtx = frets[i - 1].vertices[pos];
            let cVrtx = frets[i].vertices[pos];
            let cpStart = p5.Vector.add(pVrtx, gp5.createVector(this.arm, 0));
            let cpEnd = p5.Vector.add(cVrtx, gp5.createVector(-this.arm, 0))
            let bezierPoints = [pVrtx.x, pVrtx.y, cpStart.x, cpStart.y, cpEnd.x, cpEnd.y, cVrtx.x, cVrtx.y]
            this.points.push(bezierPoints);
        }
    }

    show(renderer, showControlPoints) {
        renderer.noFill();

        renderer.beginShape();
        renderer.vertex(this.points[0][0], this.points[0][1]);
        for (let i = 0; i < this.points.length; i++) {
            // circle(this.points[0][0], this.points[0][1], 5);
            renderer.bezierVertex(this.points[i][2], this.points[i][3], this.points[i][4], this.points[i][5], this.points[i][6], this.points[i][7]);
            if (showControlPoints) {
                renderer.stroke('orange');
                renderer.line(this.points[i][0], this.points[i][1], this.points[i][2], this.points[i][3]);
                renderer.stroke('pink');
                renderer.line(this.points[i][4], this.points[i][5], this.points[i][6], this.points[i][7]);
            }
        }
        renderer.stroke(0, 255, 125, 80);
        renderer.endShape();
    }
}