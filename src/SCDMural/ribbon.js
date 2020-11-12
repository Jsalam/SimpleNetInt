class Ribbon {
    constructor(stringA, stringB, _color) {
        this.pStringA = stringA.points;
        this.pStringB = stringB.points;
        this.color = _color;
    }


    show(renderer, showStroke, showControlPoints) {

        renderer.fill(this.color);
        renderer.beginShape();
        renderer.vertex(this.pStringA[0][0], this.pStringA[0][1]);

        // ****STRING A
        for (let i = 0; i < this.pStringA.length; i++) {
            renderer.bezierVertex(this.pStringA[i][2], this.pStringA[i][3], this.pStringA[i][4], this.pStringA[i][5], this.pStringA[i][6], this.pStringA[i][7]);
            if (showControlPoints) {
                renderer.stroke('orange');
                renderer.line(this.pStringA[i][0], this.pStringA[i][1], this.pStringA[i][2], this.pStringA[i][3]);
                renderer.stroke('pink');
                renderer.line(this.pStringA[i][4], this.pStringA[i][5], this.pStringA[i][6], this.pStringA[i][7]);
            }
        }

        // *****STRING B
        this.pStringB.reverse();
        renderer.vertex(this.pStringB[0][6], this.pStringB[0][7])

        for (let i = 0; i < this.pStringB.length; i++) {

            if (i < this.pStringB.length - 1) {
                renderer.bezierVertex(this.pStringB[i][2], this.pStringB[i][5], this.pStringB[i][4], this.pStringB[i][3], this.pStringB[i + 1][6], this.pStringB[i + 1][7]);
            } else {
                renderer.bezierVertex(this.pStringB[i][2], this.pStringB[i][5], this.pStringB[i][4], this.pStringB[i][3], this.pStringB[i][0], this.pStringB[i][1]);
            }

            if (showControlPoints) {
                // // left
                renderer.stroke('pink');
                renderer.line(this.pStringB[i][2], this.pStringB[i][5], this.pStringB[i][6], this.pStringB[i][7]);
                // //right
                renderer.stroke('orange');
                renderer.line(this.pStringB[i][0], this.pStringB[i][1], this.pStringB[i][4], this.pStringB[i][3]);
            }
        }
        this.pStringB.reverse();

        renderer.vertex(this.pStringA[0][0], this.pStringA[0][1]);

        if (showStroke) { renderer.stroke(0, 0, 255, 100) } else { renderer.noStroke(); }

        renderer.endShape();
    }
}