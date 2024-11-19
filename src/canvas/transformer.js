/**
 * This example uses glmatrix.js to perform efficient matrix operations. See http://glmatrix.net/
 */

class Transformer {
    constructor(vCluster) {
        // The cluster this transformer is associated with
        this.vCluster = vCluster;

        // The transformation matrix
        this.transform = glMatrix.mat2d.create();

        // The inverse transformation matrix
        this.invert = glMatrix.mat2d.create();

        // the current scale factor
        this.scaleFactor = 1;

        // whether or not this matrix is different than the identity matrix
        this.transformed = false;

        // ehether or not this matrix has been active for transformations
        this.active = true;

        // whether the transform matrix has changed since last push
        this.needsUpdate = false;
    }

    // Observing to Canvas
    fromCanvas(data) {

        // MouseEvents
        if (data.event instanceof MouseEvent) {
            if (data.type == "mouseclick") {}
            if (data.type == "mouseup") {}
            if (data.type == "mousedown") {}
            if (data.type == "mousedrag") {}
            if (data.type == "mousemove") {}
            if (data.type == "mousewheel") {}
            // Keyboard events
        } else if (data.event instanceof KeyboardEvent) {
            if (data.type == "keydown") {
                if (data.event.key == this.vCluster.cluster.id) {
                    this.active = !this.active;
                }
            }
            if (data.type == "keyup") {}
        }
    }

    pushVCluster(vCluster) {
        if (!this.needsUpdate) return;

        //  if (this.active) {
        let vC = vCluster;
        // if missing parameter
        if (!vC) vC = this.vCluster;

        for (let i = 0; i < vC.vNodes.length; i++) {
            let vN = vC.vNodes[i];
            let tmp = [];
            glMatrix.vec2.transformMat2d(tmp, [vN.pos.x, vN.pos.y], this.invert);
            glMatrix.vec2.transformMat2d(tmp, tmp, this.transform);
            vN.pos.set(tmp);
            vN.transformed = this.transformed;
            // reposition the connectors
            //vN.updateConnectorsCoords();
        };

        this._getInvert();
        this.needsUpdate = false;
        //  }
    }

    popVCluster(vCluster) {
        //   if (this.active) {
        let vC = vCluster;
        // if missing parameter
        if (!vC) vC = this.vCluster;

        for (let i = 0; i < vC.vNodes.length; i++) {
            let vN = vC.vNodes[i];
            let tmp = [];
            glMatrix.vec2.transformMat2d(tmp, [vN.pos.x, vN.pos.y], this.invert);
            vN.pos.set(tmp);
        };
        //  }
    }

    /** Applies the last computed tranformation to the given vectors */
    pushTo(p5vectors) {
        if (this.active) {
            for (let i = 0; i < p5vectors.length; i++) {
                let tmp = [];
                const vector = p5vectors[i];
                glMatrix.vec2.transformMat2d(tmp, [vector.x, vector.y], this.transform);
                vector.set(tmp);
            };
        }
    }

    /** Restores the given vectors to the invert of the transformation */
    popTo(p5vectors) {
        if (this.active) {
            for (let i = 0; i < p5vectors.length; i++) {
                const vector = p5vectors[i];
                let tmp = [];
                glMatrix.vec2.transformMat2d(tmp, [vector.x, vector.y], this.invert);
                vector.set(tmp);
            };
        }
    }

    // from: https://medium.com/@benjamin.botto/zooming-at-the-mouse-coordinates-with-affine-transformations-86e7312fd50b
    // Zoom the world by amount about position.
    // @param amount The amount to zoom (e.g. 1.1 to zoom in by 110%).
    // @param point The position to zoom about as a vec2.
    zoom(amount, _point) {

        let point = _point;

        if (!point) {
            // Point to scale about.
            point = glMatrix.vec2.fromValues(Canvas._mouse.x, Canvas._mouse.y);
            //point = glMatrix.vec2.fromValues(gp5.width / 2, gp5.height / 2);
        }

        if (this.active) {
            // Translation matrix that moves the world such that the mouse point is at
            // the top of the canvas (where 0,0 would normally be).
            const toPoint = glMatrix.mat2d.fromTranslation(glMatrix.mat2d.create(),
                glMatrix.vec2.fromValues(-point[0], -point[1]));

            // Scale (zoom) matrix.
            const scale = glMatrix.mat2d.fromScaling(glMatrix.mat2d.create(),
                glMatrix.vec2.fromValues(amount, amount));

            // Translation matrix which translates the world back to where it started.
            const fromPoint = glMatrix.mat2d.fromTranslation(glMatrix.mat2d.create(),
                point);

            // The new world transformation matrix is:
            // fromPoint * scale * toPoint * worldTrans.
            // Matrix multiplication is _not_ commutative and operates right to left.
            glMatrix.mat2d.multiply(this.transform, toPoint, this.transform);
            glMatrix.mat2d.multiply(this.transform, scale, this.transform);
            glMatrix.mat2d.multiply(this.transform, fromPoint, this.transform);
            this.needsUpdate = true;

            // Get the scale factor from the resulting matrix
            this.scaleFactor = this.transform[3];

            // active Flag
            this.transformed = true;
        }
    }

    /** Private function to get the invert of current transform matrix */
    _getInvert() {
        glMatrix.mat2d.invert(this.invert, this.transform);
    }

    setActive(val) {
        this.active = val;
    }

    reset() {
        if (this.active) {
            this.transform = glMatrix.mat2d.create();
            this.scaleFactor = 1;
            this.active = true;
            this.transformed = false;
            this.needsUpdate = true;
        }
    }

    initFromDataValues(data) {
        let rtn = false;

        if (data.matrixComponents) {
            let comp = JSON.parse(data.matrixComponents);
            glMatrix.mat2d.set(this.transform, comp[0], comp[1], comp[2], comp[3], comp[4], comp[5])
            this._getInvert();
            this.transformed = true;
            rtn = true;
        }
        if (data.scaleFactor) {
            this.scaleFactor = data.scaleFactor;
            rtn = true;
        }
        return rtn;
    }
}