class Ribbon {
    constructor(chordA, chordB, _color) {
        this.pChordA = chordA.points;
        this.pChordB = chordB.points;
        this.color = _color;
    }


    show(renderer, showStroke, showControlPoints) {

        renderer.fill(this.color);
        renderer.beginShape();
        renderer.vertex(this.pChordA[0][0], this.pChordA[0][1]);

        // ****STRING A
        for (let i = 0; i < this.pChordA.length; i++) {
            renderer.bezierVertex(this.pChordA[i][2], this.pChordA[i][3], this.pChordA[i][4], this.pChordA[i][5], this.pChordA[i][6], this.pChordA[i][7]);
            if (showControlPoints) {
                renderer.stroke('orange');
                renderer.line(this.pChordA[i][0], this.pChordA[i][1], this.pChordA[i][2], this.pChordA[i][3]);
                renderer.stroke('pink');
                renderer.line(this.pChordA[i][4], this.pChordA[i][5], this.pChordA[i][6], this.pChordA[i][7]);
            }
        }

        // *****STRING B
        this.pChordB.reverse();
        renderer.vertex(this.pChordB[0][6], this.pChordB[0][7])

        for (let i = 0; i < this.pChordB.length; i++) {

            if (i < this.pChordB.length - 1) {
                renderer.bezierVertex(this.pChordB[i][2], this.pChordB[i][5], this.pChordB[i][4], this.pChordB[i][3], this.pChordB[i + 1][6], this.pChordB[i + 1][7]);
            } else {
                renderer.bezierVertex(this.pChordB[i][2], this.pChordB[i][5], this.pChordB[i][4], this.pChordB[i][3], this.pChordB[i][0], this.pChordB[i][1]);
            }

            if (showControlPoints) {
                // // left
                renderer.stroke('pink');
                renderer.line(this.pChordB[i][2], this.pChordB[i][5], this.pChordB[i][6], this.pChordB[i][7]);
                // //right
                renderer.stroke('orange');
                renderer.line(this.pChordB[i][0], this.pChordB[i][1], this.pChordB[i][4], this.pChordB[i][3]);
            }
        }
        this.pChordB.reverse();

        renderer.vertex(this.pChordA[0][0], this.pChordA[0][1]);

        if (showStroke) { renderer.stroke(0, 0, 255, 100) } else { renderer.noStroke(); }

        renderer.endShape();
    }

    getJSON() {
        let rtn = {
            points: []
        };

        // first point string A
        //renderer.vertex(this.pChordA[0][0], this.pChordA[0][1]);

        let tmp = {
            anchorX: this.pChordA[0][0],
            anchorY: this.pChordA[0][1],
            controlLeftX: this.pChordA[0][2],
            controlLeftY: this.pChordA[0][3],
            controlRightX: this.pChordA[0][0],
            controlRightY: this.pChordA[0][1]
        }
        rtn.points.push(tmp);

        // following points stringA
        for (let i = 1; i < this.pChordA.length; i++) {
            // renderer.bezierVertex(this.pChordA[i][2], this.pChordA[i][3], this.pChordA[i][4], this.pChordA[i][5], this.pChordA[i][6], this.pChordA[i][7]);
            tmp = {
                anchorX: this.pChordA[i - 1][6],
                anchorY: this.pChordA[i - 1][7],
                controlLeftX: this.pChordA[i - 1][4],
                controlLeftY: this.pChordA[i - 1][5],
                controlRightX: this.pChordA[i][2],
                controlRightY: this.pChordA[i][3],
            }
            rtn.points.push(tmp);
        }

        tmp = {
            anchorX: this.pChordA[this.pChordA.length - 1][6],
            anchorY: this.pChordA[this.pChordA.length - 1][7],
            controlLeftX: this.pChordA[this.pChordA.length - 1][2],
            controlLeftY: this.pChordA[this.pChordA.length - 1][5],
            controlRightX: this.pChordA[this.pChordA.length - 1][6],
            controlRightY: this.pChordA[this.pChordA.length - 1][7],
        }
        rtn.points.push(tmp);

        // first point string b
        this.pChordB.reverse();
        //renderer.vertex(this.pChordB[0][6], this.pChordB[0][7])
        tmp = {
            anchorX: this.pChordB[0][6],
            anchorY: this.pChordB[0][7],
            controlLeftX: this.pChordB[0][6],
            controlLeftY: this.pChordB[0][7],
            controlRightX: this.pChordB[0][2],
            controlRightY: this.pChordB[0][5]
        }
        rtn.points.push(tmp);

        // following points string b
        for (let i = 1; i < this.pChordB.length; i++) {

            // if (i < this.pChordB.length - 1) {
            //renderer.bezierVertex(this.pChordB[i][2], this.pChordB[i][5], this.pChordB[i][4], this.pChordB[i][3], this.pChordB[i + 1][6], this.pChordB[i + 1][7]);
            tmp = {
                anchorX: this.pChordB[i][6],
                anchorY: this.pChordB[i][7],
                controlLeftX: this.pChordB[i - 1][4],
                controlLeftY: this.pChordB[i - 1][3],
                controlRightX: this.pChordB[i][2],
                controlRightY: this.pChordB[i][5],
            }
            rtn.points.push(tmp);
        }


        //renderer.bezierVertex(this.pChordB[i][2], this.pChordB[i][5], this.pChordB[i][4], this.pChordB[i][3], this.pChordB[i][0], this.pChordB[i][1]);
        tmp = {
            anchorX: this.pChordB[this.pChordB.length - 1][0],
            anchorY: this.pChordB[this.pChordB.length - 1][1],
            controlLeftX: this.pChordB[this.pChordB.length - 1][2],
            controlLeftY: this.pChordB[this.pChordB.length - 1][5],
            controlRightX: this.pChordB[this.pChordB.length - 1][0],
            controlRightY: this.pChordB[this.pChordB.length - 1][1],
        }
        rtn.points.push(tmp);

        this.pChordB.reverse();

        // // close ribbon
        // // renderer.vertex(this.pChordA[0][0], this.pChordA[0][1]);

        tmp = {
            anchorX: this.pChordA[0][0],
            anchorY: this.pChordA[0][1],
            controlLeftX: this.pChordA[0][0],
            controlLeftY: this.pChordA[0][1],
            controlRightX: this.pChordA[0][2],
            controlRightY: this.pChordA[0][3]
        }
        rtn.points.push(tmp);


        return rtn;

    }

    getJSON2() {

    }
}