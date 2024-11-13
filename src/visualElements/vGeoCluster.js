const {mat4, vec4, vec3} = glMatrix;


class VGeoCluster extends VCluster {
    static total = 0;
    static _pixelBuffer;
    static _idBuffer;
    static geometryCache = {}

    static MAP_SIZE = 0.6;

    static get width() {
        return gp5.width;
    }

    static get height() {
        return gp5.height;
    }

    static get pixelBuffer() {
        if (!this._pixelBuffer) {
            this._pixelBuffer = gp5.createGraphics(this.width, this.height, gp5.WEBGL);
        }
        return this._pixelBuffer;
    }

    static get idBuffer() {
        if (!this._idBuffer) {
            this._idBuffer = gp5.createGraphics(this.width, this.height, gp5.WEBGL);
        }
        return this._idBuffer;
    }


    static projectMercator(lon, lat, center = gp5.createVector(), scale = 1) {
        const x = 1 / (2 * Math.PI) * lon * (Math.PI / 180);
        const y = 1 / (2 * Math.PI) * (Math.PI - Math.log(Math.tan(Math.PI / 4 + lat * (Math.PI / 180) / 2)));
        return [scale * (x - center.x), scale * (y - center.y)];
    }

    static getBoundingBox(features) {
        let xMin = Infinity;
        let xMax = -Infinity;
        let yMin = Infinity;
        let yMax = -Infinity;

        function traverse(rings) {
            if (rings.length === 0) return;
            for (let [lon, lat] of rings[0]) {
                const [x, y] = VGeoCluster.projectMercator(lon, lat);
                xMin = Math.min(xMin, x);
                xMax = Math.max(xMax, x);
                yMin = Math.min(yMin, y);
                yMax = Math.max(yMax, y);
                yMax = Math.max(yMax, y);
            }
        }

        for (let feature of features) {
            const geom = feature.geometry;
            if (geom.type === 'Polygon') {
                traverse(geom.coordinates);
            } else if (geom.type === 'MultiPolygon') {
                for (const polygon of geom.coordinates) {
                    traverse(polygon);
                }
            }
        }
        return [xMin, xMax, yMin, yMax];
    }

    static getCentroid(geom, center, scale) {
        let numPoints = 0;
        let xSum = 0;
        let ySum = 0;

        function traverse(rings) {
            if (rings.length === 0) return;
            for (let [lon, lat] of rings[0]) {
                const [x, y] = VGeoCluster.projectMercator(lon, lat, center, scale);
                numPoints++;
                xSum += x;
                ySum += y;
            }
        }

        if (geom.type === 'Polygon') {
            traverse(geom.coordinates);
        } else if (geom.type === 'MultiPolygon') {
            for (const polygon of geom.coordinates) {
                traverse(polygon);
            }
        }
        return gp5.createVector(xSum / numPoints, ySum / numPoints);
    }

    static drawShape(geom, center, scale) {
        function traverse(rings) {
            if (rings.length === 0) return;
            VGeoCluster.pixelBuffer.beginShape();
            for (let [lon, lat] of rings[0]) {
                const [x, y] = VGeoCluster.projectMercator(lon, lat, center, scale);
                VGeoCluster.pixelBuffer.vertex(x, y);
            }
            VGeoCluster.pixelBuffer.endShape();
        }

        if (geom.type === 'Polygon') {
            traverse(geom.coordinates);
        } else if (geom.type === 'MultiPolygon') {
            for (const polygon of geom.coordinates) {
                traverse(polygon);
            }
        }
    }

    static computeCentroids(features, center, scale) {
        const index = {};
        for (const feature of features) {
            const geocode = feature.properties.GEOCODIGO;
            index[geocode] = this.getCentroid(feature.geometry, center, scale);
        }
        return index;
    }


    static loadGeometry(url) {
        if (!this.geometryCache[url]) {
            this.geometryCache[url] = new Promise((resolve) => {
                gp5.loadJSON(url, ({features}) => {
                    const [xMin, xMax, yMin, yMax] = this.getBoundingBox(features);
                    const center = gp5.createVector((xMin + xMax) / 2, (yMin + yMax) / 2);
                    const scale = VGeoCluster.MAP_SIZE * Math.min(this.width / (xMax - xMin), this.height / (yMax - yMin));
                    const centroidByGeocode = this.computeCentroids(features, center, scale);
                    const geometry = VGeoCluster.pixelBuffer.buildGeometry(() => {
                        for (let [i, feature] of features.entries()) {
                            VGeoCluster.pixelBuffer.noStroke();
                            VGeoCluster.pixelBuffer.fill(
                                ((i + 1) >> 16) & 0xff,
                                ((i + 1) >> 8) & 0xff,
                                ((i + 1) >> 0) & 0xff,
                            );
                            this.drawShape(feature.geometry, center, scale);
                        }
                    });
                    resolve({
                        features,
                        centroidByGeocode,
                        geometry,
                    })
                });
            });
        }
        return this.geometryCache[url];
    }

    static selectedFeatureId = 0;

    static detectHit() {
        // TODO: differentiate layers
        const bytes = this.idBuffer.get(Canvas._mouse.x, Canvas._mouse.y);
        this.selectedFeatureId = ((bytes[0] << 16) | (bytes[1] << 8) | bytes[2]);
    }

    centroidByGeocode = {};
    features = [];
    clusterGeometry = null;
    pixelShader = null;
    idShader = null;

    r1 = 10;
    r2 = 15;
    s1 = 5;
    s2 = 1;

    layerGap = 500;
    rotationX = -0.51;
    rotationY = 0.51;
    cameraDistance = 800;

    // tangent of 1/2 vertical field-of-view
    tanHalfFovY = VGeoCluster.height / 2 / this.cameraDistance;

    modelViewMatrix = mat4.create();
    projectionMatrix = mat4.create();

    palette = gp5.createImage(1, 1);

    constructor(cluster, posX, posY, width, height, palette) {
        super(cluster, posX, posY, width, height, palette);

        this.index = VGeoCluster.total++;

        gp5.loadShader('/src/shader/shader_color.vert', '/src/shader/shader.frag', (shader) => {
            this.pixelShader = shader;
        }, console.error)
        gp5.loadShader('/src/shader/shader_id.vert', '/src/shader/shader.frag', (shader) => {
            this.idShader = shader;
        }, console.error);

        // TODO: this will be loaded from JSON
        const geoJsonUrl = '/files/Brazil_ADM2.geojson';

        // TODO: this will be loaded from JSON
        const getColorAt = (index) => {
            const palettes = [
                ['#e7f39b', '#c4fa84', '#a0f87e', '#7feb86', '#66ce93', '#59a0a0', '#535ca5'],
                ['#f3e79b', '#fac484', '#f8a07e', '#eb7f86', '#ce6693', '#a059a0', '#5c53a5'],
                ['#e79bf3', '#c484fa', '#a07ef8', '#7f86eb', '#6693ce', '#59a0a0', '#53a55c'],
            ];
            const palette = palettes[this.index];
            return gp5.color(palette[index % palette.length]);
        }

        VGeoCluster.loadGeometry(geoJsonUrl).then(data => {
            this.features = data.features;
            this.centroidByGeocode = data.centroidByGeocode;
            this.clusterGeometry = data.geometry;
            this.palette = gp5.createImage(this.features.length, 1);
            this.palette.loadPixels();
            for (let i = 0; i < this.features.length; ++i) {
                this.palette.set(i, 0, getColorAt(i).levels);
            }
            this.palette.updatePixels();
        });

    }

    warp(r) {
        if (r < this.r1) return this.s1 * r;
        if (r < this.r2) {
            return this.s1 * r + ((this.s1 - this.s2) * (r - this.r1) * (r - this.r1)) / (2.0 * (this.r1 - this.r2));
        }
        return this.s1 * this.r2 + ((this.s2 - this.s1) * (this.r2 - this.r1)) / 2.0 + this.s2 * (r - this.r2);
    }

    updateMatrices() {
        const flipY = mat4.fromValues(
            1, 0, 0, 0,
            0, -1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        const offset = vec3.fromValues(0, 0, this.layerGap * (this.index - (VGeoCluster.total - 1) / 2));
        const translate = mat4.fromTranslation(mat4.create(), offset);
        const rotateX = mat4.fromXRotation(mat4.create(), this.rotationX);
        const rotateY = mat4.fromYRotation(mat4.create(), this.rotationY);
        const modelMatrix = mat4.create();
        mat4.mul(modelMatrix, translate, flipY);
        mat4.mul(modelMatrix, rotateX, modelMatrix);
        mat4.mul(modelMatrix, rotateY, modelMatrix);
        const viewMatrix = mat4.lookAt(mat4.create(), [0, 0, this.cameraDistance], [0, 0, 0], [0, 1, 0]);
        this.modelViewMatrix = mat4.mul(mat4.create(), viewMatrix, modelMatrix);
        this.projectionMatrix = mat4.perspective(
            mat4.create(),
            2 * Math.atan(this.tanHalfFovY), // vertical FOV
            VGeoCluster.width / VGeoCluster.height, // aspect ratio
            0.1 * 800, // near plane
            10 * 800 // far plane
        );
    }

    get focusRadius() {
        return this.s1 * this.r1
    }

    updateVNodePositions() {
        const MVP = mat4.create();
        mat4.mul(MVP, this.projectionMatrix, this.modelViewMatrix);

        for (let vNode of this.vNodes) {
            const geocode =  vNode.node.attributes.attRaw.geocode;
            if (!this.centroidByGeocode[geocode]) continue;

            const vIn = this.centroidByGeocode[geocode].copy();
            vIn.sub(this.mouseX_object, this.mouseY_object);
            const r = this.warp(vIn.mag())
            vIn.setMag(r);
            vIn.add(this.mouseX_object, this.mouseY_object);
            const position_object = vec4.fromValues(vIn.x, vIn.y, 0, 1);
            const position_NDC = vec4.transformMat4(vec4.create(), position_object, MVP);

            vNode.shouldShowText = r < this.focusRadius;
            vNode.pos = gp5.createVector(position_NDC[0] / position_NDC[3], position_NDC[1] / position_NDC[3])
                .mult(VGeoCluster.width / 2, -VGeoCluster.height / 2)
                .add(VGeoCluster.width / 2, VGeoCluster.height / 2);
        }
    }

    /**
     * Determine mouse coordinates in the map plane (object space) using ray casting
     */
    unprojectMousePosition() {
        const normal = vec4.fromValues(0, 0, 1, 0); // direction (w=0)
        const center = vec4.fromValues(0, 0, 0, 1); // position (w=1)
        vec4.transformMat4(normal, normal, this.modelViewMatrix);
        vec4.transformMat4(center, center, this.modelViewMatrix);

        const ray = vec4.fromValues(
            Canvas._mouse.x - VGeoCluster.width / 2,
            -(Canvas._mouse.y - VGeoCluster.height / 2),
            -(VGeoCluster.height / 2 / this.tanHalfFovY),
            0
        );
        const signedDistance = vec4.dot(ray, normal);
        if (signedDistance >= 0) {
            // if the ray is directed away from the plane, adjust it slightly to make it directed towards the plane
            vec4.scaleAndAdd(ray, ray, normal, -(signedDistance + 0.1));
        }
        const t = vec4.dot(center, normal) / vec4.dot(ray, normal);
        const pos_camera = vec4.fromValues(ray[0] * t, ray[1] * t, ray[2] * t, 1);
        const modelViewInverse = mat4.invert(mat4.create(), this.modelViewMatrix);
        const pos_object = vec4.transformMat4(vec4.create(), pos_camera, modelViewInverse);
        this.mouseX_object = pos_object[0] / pos_object[3];
        this.mouseY_object = pos_object[1] / pos_object[3];
    }


    handleEvents() {
        if (gp5.keyIsPressed) {
            if (gp5.key === '=') {
                this.s1 = gp5.constrain(this.s1 + 1, 1, 50);
            }
            if (gp5.key === '-') {
                this.s1 = gp5.constrain(this.s1 - 1, 1, 50);
            }
            if (gp5.key === 'k') {
                this.layerGap += 10;
            }
            if (gp5.key === 'j') {
                this.layerGap -= 10;
            }
            if (gp5.key === 'ArrowUp') {
                this.rotationX = gp5.constrain(this.rotationX - 0.05, -Math.PI / 2, Math.PI / 2);
            }
            if (gp5.key === 'ArrowDown') {
                this.rotationX = gp5.constrain(this.rotationX + 0.05, -Math.PI / 2, Math.PI / 2);
            }
            if (gp5.key === 'ArrowLeft') {
                this.rotationY = gp5.constrain(this.rotationY - 0.05, -Math.PI / 2, Math.PI / 2);
            }
            if (gp5.key === 'ArrowRight') {
                this.rotationY = gp5.constrain(this.rotationY + 0.05, -Math.PI / 2, Math.PI / 2);
            }
        }
        this.updateMatrices();
        this.unprojectMousePosition();
        this.updateVNodePositions();
    }

    renderToBuffer(buffer, shader) {
        buffer.shader(shader);
        shader.setUniform('modelViewMatrix', this.modelViewMatrix);
        shader.setUniform('projectionMatrix', this.projectionMatrix);
        shader.setUniform('mouse', [this.mouseX_object, this.mouseY_object]);
        shader.setUniform('r1', this.r1);
        shader.setUniform('r2', this.r2);
        shader.setUniform('s1', this.s1);
        shader.setUniform('s2', this.s2);
        shader.setUniform('palette', this.palette);
        shader.setUniform('paletteSize', this.palette.width);
        shader.setUniform('selected', VGeoCluster.selectedFeatureId);
        buffer.model(this.clusterGeometry);
    }

    show(renderer) {
        super.show(renderer);
        this.handleEvents();
        if (this.clusterGeometry) {
            if (this.pixelShader) {
                VGeoCluster.pixelBuffer.texture(this.palette);
                this.renderToBuffer(VGeoCluster.pixelBuffer, this.pixelShader);
            }
            if (this.idShader) {
                this.renderToBuffer(VGeoCluster.idBuffer, this.idShader);
            }
        }
    }
}