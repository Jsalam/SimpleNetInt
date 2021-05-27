class Fret {
    /**
     * 
     * @param {*} previous the coordinates of the previous Fret
     * @param {*} gap the ribbon height
     * @param {*} chords the number of chords
     * @param {*} pos the fret space where the node will be placed
     * @param {*} factor 
     * @param {*} vNode 
     */
    constructor(previous, gap, chords, pos, factor, vNode) {

        this.gap = gap;
        this.nChords = chords;
        this.neckH = gap * chords;
        if (pos > chords) {
            console.log("Position in fret greater than number of ribbons")
            this.pos = 1
        } else {
            this.pos = pos;
        }
        this.vertices;
        this.vNode = vNode;
        this.init(previous, factor)
    }

    init(previous, factor) {
        // if a fret
        if (previous instanceof Fret) {
            this.org = previous.org
            this.vertices = this.computeVertices(this.org, this.pos, factor);

        } else {
            this.org = previous
            this.vertices = this.computeVertices(this.org, this.pos, factor);
        }

        if (this.vNode) {
            //this.vNode.updateCoords(p5.Vector.add(this.org, gp5.createVector(0, 87.5)), 0)
            // this.vNode.updateCoords(gp5.createVector(this.vNode.pos.x, this.org.y + 87.5), 0)
            this.org = gp5.createVector(this.vNode.pos.x, this.vNode.pos.y - 87.5); //this.vNode.pos;
            this.vertices = this.computeVertices(this.org, this.pos, factor);
        }

    }

    updateCoordinates() {
        if (this.vNode) {
            this.org = this.vNode.pos;
        }
    }

    show(renderer) {
        // renderer.fill('red');
        // renderer.textSize(10);
        // renderer.textAlign(gp5.CENTER)
        // renderer.text("T " + this.pos, this.org.x, this.org.y + 100);
        // for (let i = 0; i < this.vertices.length; i++) {
        //     renderer.circle(this.vertices[i].x, this.vertices[i].y, 5);
        //     this.showGapID(renderer, i, this.vertices[i], this.gap);
        // }

        this.showPosition(renderer, this.org);

        // show vNode on fret
        if (this.vNode) {
            this.vNode.setColor("#ff0000")
        }
    }

    /**
     * Distribute vertices
     * @param {*} org the fret's x y z coordinate
     * @param {*} pos the position between chords where this fret's element is placed. The top most is 0
     */
    computeVertices(org, pos, factor) {
        let vertices = [];
        let x = org.x;
        let y = org.y;

        // Get the neckHeight adjusted by factor
        let neckScaledHeight = 0;
        for (let i = 0; i < this.nChords + 1; i++) {
            neckScaledHeight += this.getGapFactor(pos, i, factor);
        }

        // Substract the unscaled neck height from the scaled neck height to center the chords
        let disp = (this.neckH / 2) - (neckScaledHeight / 2);

        // Correct the y position of the entire chord set. *** Commenting this line the fret looks straight ***
        y += disp + this.getDisplacement2(pos, factor);

        // Estimate vertices for chords
        for (let i = 0; i < this.nChords + 1; i++) {
            let newGap = this.getGapFactor(pos, i, factor);
            y += newGap;
            vertices.push(gp5.createVector(x, y));
        }
        return vertices;
    }

    /**
     * 
     * @param {*} pos the position between chords where this fret's element is placed
     */
    getDisplacement(pos) {
        let midReference = (this.nChords + 1) / 2;
        let disp = 0;
        if (pos != midReference) disp = midReference - pos;
        return disp;
    }

    getDisplacement2(pos, factor) {
        let midReference = (this.nChords + 1) / 2;
        let times = 0;
        let disp = 0;
        if (pos != midReference) {
            times = midReference - pos;
            disp = times * this.gap * factor;
        }
        return disp;
    }


    getGapFactor(pos, gapID, factor) {
        let newGap = this.gap;
        if (gapID != pos) newGap = (this.neckH - this.gap) * factor / (this.nChords - 1);
        // The first chord is never modified
        if (gapID == 0) {
            newGap = 0;
        }
        return newGap;
    }

    showGapID(renderer, i, org, gap) {
        renderer.noStroke();
        renderer.fill('black')
        if (i != 0) {
            renderer.text(i, org.x + 5, org.y - (gap / 2));
        }
    }

    showPosition(renderer, pos) {
        // node
        renderer.fill(55, 50);
        renderer.stroke(55, 60);
        renderer.circle(pos.x, pos.y + this.neckH / 2, 7);
        // renderer.line(pos.x, pos.y, pos.x + 5, pos.y);
        // renderer.line(pos.x, pos.y + this.neckH, pos.x + 5, pos.y + this.neckH);
        renderer.noStroke();
    }

    getJSON() {
        let rtn = {
            orgX: this.org.x,
            orgY: this.org.y,
            gap: this.gap,
            nChords: this.nChords,
            neckH: this.neckH,
            position: this.pos,
            vertices: []
        }

        for (let i = 0; i < this.vertices.length; i++) {
            let tmp = {
                x: this.vertices[i].x,
                y: this.vertices[i].y,
            }
            rtn.vertices.push(tmp)
        }

        return rtn;
    }

}