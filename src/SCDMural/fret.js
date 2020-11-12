class Fret {
    constructor(org, gap, strings, pos) {
        this.org = org;
        this.gap = gap;
        this.nStrings = strings;
        this.neckH = gap * strings;
        this.pos = pos;
        this.vertices = this.computeVertices(this.org, this.pos);
    }

    show(renderer) {
        for (let i = 0; i < this.vertices.length; i++) {
            renderer.stroke('white');
            renderer.noFill();
            //renderer.circle(this.vertices[i].x, this.vertices[i].y, 5);
            // this.showGapID(i, this.vertices[i], newGap);
        }
        this.showPosition(renderer, this.org);
    }

    computeVertices(org, pos) {
        let vertices = [];
        let x = org.x;
        let y = org.y + this.getDisplacement(pos) * this.gap;
        for (let i = 0; i < this.nStrings + 1; i++) {
            let newGap = this.getGapFactor(pos, i);
            y += newGap;
            vertices.push(gp5.createVector(x, y));
        }
        return vertices;
    }

    showGapID(i, org, gap) {
        noStroke();
        fill('white')
        if (i != 0) {
            text(i, org.x + 5, org.y - (gap / 2));
        }
    }

    showPosition(renderer, pos) {
        // node
        renderer.fill(255, 0, 0, 50);
        renderer.stroke(255, 0, 0, 60);
        renderer.circle(pos.x, pos.y + this.neckH / 2, 7);
        // renderer.line(pos.x, pos.y, pos.x + 5, pos.y);
        // renderer.line(pos.x, pos.y + this.neckH, pos.x + 5, pos.y + this.neckH);
    }

    getDisplacement(pos) {
        let midReference = (this.nStrings + 1) / 2;
        let disp = midReference - pos;
        if (pos > midReference) {
            disp = 0;
        }
        return disp;
    }

    getGapFactor(pos, gapID) {
        let midReference = (this.nStrings + 1) / 2;
        let newGap = this.gap;
        if (pos < midReference) {
            if (gapID > pos) {
                newGap = (this.neckH - this.gap) * 0.5 / (this.nStrings - pos);
            }
        } else if (pos > midReference) {
            if (gapID < pos) newGap = ((this.neckH * 0.5) - (this.gap / 2)) / (pos - 1);
        }
        if (gapID == 0) {
            newGap = 0;
        }
        return newGap;
    }
}