const {mat4, vec4} = glMatrix;

class VGeoCluster extends VCluster {
    r1 = 5;
    r2 = 10;
    s1 = 5;
    s2 = 1;
    theta = 0;

    features = []
    centroids = [];

    colors = ['#f3e79b', '#fac484', '#f8a07e', '#eb7f86', '#ce6693', '#a059a0', '#5c53a5']
        .map(c => gp5.color(c).levels.map(v => v / 255)).flat();

    lonCenter = -51.9253;
    latCenter = -14.2350;
    scale = 5000;
    width = gp5.width;
    height = gp5.height;
    cameraDistance = 800;
    s = this.cameraDistance / (this.height / 2);

    pixelShader = gp5.loadShader('/src/shader/shader_color.vert', '/src/shader/shader.frag')
    featureIdShader = gp5.loadShader('/src/shader/shader_id.vert', '/src/shader/shader.frag');

    graphics = gp5.createGraphics(this.width, this.height, gp5.WEBGL);
    hitDetectionBuf = this.graphics.createFramebuffer({textureFiltering: gp5.NEAREST});
    geometry = null;

    constructor(cluster, posX, posY, width, height, palette) {
        super(cluster, posX, posY, width, height, palette);
        gp5.loadJSON('/files/geoBoundaries-BRA-ADM2_simplified.geojson', ({features}) => {
            this.features = features;
            this.centroids = this.getCentroids(features);
            this.updateVNodePositions();
            this.geometry = this.graphics.buildGeometry(() => {
                for (let [i, feature] of features.entries()) {
                    this.graphics.noStroke();
                    this.graphics.fill(
                        ((i + 1) >> 16) & 0xff,
                        ((i + 1) >> 8) & 0xff,
                        ((i + 1) >> 0) & 0xff,
                    );
                    this.drawShape(feature.geometry);
                }
            });
        });
    }

    warp(r) {
        if (r < this.r1) return this.s1 * r;
        if (r < this.r2) {
            return this.s1 * r + ((this.s1 - this.s2) * (r - this.r1) * (r - this.r1)) / (2.0 * (this.r1 - this.r2));
        }
        return this.s1 * this.r2 + ((this.s2 - this.s1) * (this.r2 - this.r1)) / 2.0 + this.s2 * (r - this.r2);
    }

    updateVNodePositions() {
        const modelMatrix = mat4.rotateX(mat4.create(), mat4.create(), -this.theta);
        const viewMatrix = mat4.lookAt(mat4.create(), [0, 0, this.cameraDistance], [0, 0, 0], [0, 1, 0])
        const projectionMatrix = mat4.perspective(mat4.create(), 2 * Math.atan(1 / this.s), this.width / this.height, 0.1 * 800, 10 * 800)
        const M = mat4.create();
        mat4.mul(M, viewMatrix, modelMatrix);
        mat4.mul(M, projectionMatrix, M);

        const vOut = vec4.create();

        for (let vNode of this.vNodes) {
            const index = vNode.node.idCat.index + 100;
            const vIn = this.centroids[index].copy();
            vIn.sub(this.mouseX, this.mouseY);
            vIn.setMag(this.warp(vIn.mag()));
            vIn.add(this.mouseX, this.mouseY);
            vIn.sub(this.width / 2, this.height / 2).mult(1, -1);
            vec4.set(vOut, vIn.x, vIn.y, 0, 1);
            vec4.transformMat4(vOut, vOut, M);

            vNode.pos = gp5.createVector(vOut[0] / vOut[3], -vOut[1] / vOut[3])
                .mult(this.width / 2, this.height / 2)
                .add(this.width / 2, this.height / 2);
        }
    }

    projectMercator(lon, lat) {
        const x = 1 / (2 * Math.PI) * lon * (Math.PI / 180);
        const y = 1 / (2 * Math.PI) * (Math.PI - Math.log(Math.tan(Math.PI / 4 + lat * (Math.PI / 180) / 2)));
        const xCenter = 1 / (2 * Math.PI) * (this.lonCenter * (Math.PI / 180));
        const yCenter = 1 / (2 * Math.PI) * (Math.PI - Math.log(Math.tan(Math.PI / 4 + this.latCenter * (Math.PI / 180) / 2)));
        return [
            this.width / 2 + this.scale * (x - xCenter),
            this.height / 2 + this.scale * (y - yCenter)
        ]
    }

    getCentroidsOf(geom) {
        let numPoints = 0;
        let xSum = 0;
        let ySum = 0;

        const traverPolygon = (rings) => {
            if (rings.length === 0) return;
            for (let [lon, lat] of rings[0]) {
                const [x, y] = this.projectMercator(lon, lat);
                numPoints++;
                xSum += x;
                ySum += y;
            }
        }

        if (geom.type === 'Polygon') {
            traverPolygon(geom.coordinates);
        } else if (geom.type === 'MultiPolygon') {
            for (const polygon of geom.coordinates) {
                traverPolygon(polygon);
            }
        }
        return gp5.createVector(xSum / numPoints, ySum / numPoints);
    }

    getCentroids(features) {
        const res = [];
        for (let feature of features) {
            res.push(this.getCentroidsOf(feature.geometry))
        }
        return res;
    }


    drawPolygon(rings) {
        if (rings.length == 0) return;
        this.graphics.beginShape();
        for (let [lon, lat] of rings[0]) {
            const [x, y] = this.projectMercator(lon, lat);
            this.graphics.vertex(x, y);
        }
        this.graphics.endShape(gp5.CLOSE);
    }


    drawShape(geom) {
        if (geom.type == 'Polygon') {
            this.drawPolygon(geom.coordinates);
        } else if (geom.type == 'MultiPolygon') {
            for (const polygon of geom.coordinates) {
                this.drawPolygon(polygon);
            }
        }
    }

    unprojectMousePosition() {
        const modelMatrix = mat4.rotateX(mat4.create(), mat4.create(), this.theta);
        const viewMatrix = mat4.lookAt(mat4.create(), [0, 0, this.cameraDistance], [0, 0, 0], [0, 1, 0])
        const modelView = mat4.mul(mat4.create(), viewMatrix, modelMatrix);
        const modelViewInverse = mat4.invert(mat4.create(), modelView);
        const ndc = gp5.createVector(Canvas._mouse.x, Canvas._mouse.y).div(this.width, this.height).mult(2).sub(1, 1).mult(1, -1);
        const K = this.cameraDistance * Math.cos(this.theta) / (ndc.y * Math.sin(this.theta) + this.s * Math.cos(this.theta));
        const posCameraSpace = vec4.fromValues(this.width / this.height * ndc.x * K, ndc.y * K, -this.s * K, 1.0);
        const posObjectSpace = vec4.transformMat4(vec4.create(), posCameraSpace, modelViewInverse);
        this.mouseX = (posObjectSpace[0] / posCameraSpace[3]) + this.width / 2;
        this.mouseY = (-posObjectSpace[1] / posCameraSpace[3]) + this.height / 2;
    }


    update() {
        if (gp5.keyIsDown(187)) {
            this.s1 = gp5.constrain(this.s1 + 1, 2, 50);
        }
        if (gp5.keyIsDown(189)) {
            this.s1 = gp5.constrain(this.s1 - 1, 2, 50);
        }
        if (gp5.keyIsDown(gp5.UP_ARROW)) {
            this.theta = gp5.constrain(this.theta + 0.05, 0, Math.PI / 2);
        }
        if (gp5.keyIsDown(gp5.DOWN_ARROW)) {
            this.theta = gp5.constrain(this.theta - 0.05, 0, Math.PI / 2);
        }
        this.unprojectMousePosition();
        const [b1, b2, b3] = this.hitDetectionBuf.get(Canvas._mouse.x, Canvas._mouse.y);
        this.selected = ((b1 << 16) | (b2 << 8) | b3);
        this.updateVNodePositions();
    }

    renderToGraphics(compiledShader) {
        this.graphics.push();
        this.graphics.background(0, 0, 0, 0);
        this.graphics.rotateX(this.theta);
        this.graphics.translate(-this.width / 2, -this.height / 2);
        this.graphics.shader(compiledShader);
        compiledShader.setUniform('mouse', [this.mouseX, this.mouseY]);
        compiledShader.setUniform('r1', this.r1);
        compiledShader.setUniform('r2', this.r2);
        compiledShader.setUniform('s1', this.s1);
        compiledShader.setUniform('s2', this.s2);
        compiledShader.setUniform('colors', this.colors);
        compiledShader.setUniform('selected', this.selected);
        this.graphics.model(this.geometry);
        this.graphics.pop();
    }

    show(renderer) {
        super.show(renderer);
        if (!this.geometry) return;
        this.update();
        this.renderToGraphics(this.pixelShader);
        this.hitDetectionBuf.begin();
        this.renderToGraphics(this.featureIdShader);
        this.hitDetectionBuf.end();
        renderer.image(this.graphics, 0, 0);
    }
}