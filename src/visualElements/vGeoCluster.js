"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VGeoCluster = void 0;
var glMatrix = require("gl-matrix");
var main_1 = require("../main");
var p5_1 = require("p5");
var chroma_js_1 = require("chroma-js");
var DOMManager_1 = require("../GUI/DOM/DOMManager");
var canvas_1 = require("../canvas/canvas");
var vCluster_1 = require("./vCluster");
var clusterFactory_1 = require("../factories/clusterFactory");
var mat4 = glMatrix.mat4, vec4 = glMatrix.vec4, vec3 = glMatrix.vec3;
var VGeoCluster = /** @class */ (function (_super) {
    __extends(VGeoCluster, _super);
    /**
     * ************************** constructor **************************
     * @param {Cluster} cluster The cluster object with nodes and edges
     * @param {Number} posX
     * @param {Number} posY
     * @param {Number} width
     * @param {Number} height
     * @param {Object} palette Retrieved from the ColorFactory collection of palettes
     * @param {String} cartography The URL of the GeoJSON file
     */
    function VGeoCluster(cluster, posX, posY, width, height, palette, bbox, cartography, secondaryCartography, paletteByDimension) {
        var _this = _super.call(this, cluster, posX, posY, width, height, palette) || this;
        _this.paletteByDimension = paletteByDimension;
        _this.numFeatures = 1;
        _this.featureIndexByGeocode = {};
        _this.centroidByGeocode = {};
        _this.clusterGeometry = null;
        _this.secondaryClusterGeometry = null;
        _this.pixelShader = null;
        _this.idShader = null;
        _this.outlineShader = null;
        _this.r1 = 10;
        _this.r2 = 15;
        _this.s1 = 1;
        _this.s2 = 1;
        _this.layerIndexInFocus = 0;
        _this.layerGap = 1;
        _this.rotationX = 0;
        _this.rotationY = 0;
        _this.cameraDistance = 900;
        // tangent of 1/2 vertical field-of-view
        _this.tanHalfFovY = VGeoCluster.height / 2 / _this.cameraDistance;
        _this.modelViewMatrix = mat4.create();
        _this.projectionMatrix = mat4.create();
        _this._palette = main_1.gp5.createImage(1, 1);
        _this.scale = 1;
        _this.zoomDirection = 1;
        _this.scalarTransform = VGeoCluster.scalarTransforms.linear;
        VGeoCluster.all.push(_this);
        VGeoCluster.visible.push(_this);
        _this.index = clusterFactory_1.ClusterFactory.vClusters.length;
        main_1.gp5.loadShader("./src/shader/shader_color.vert", "./src/shader/shader.frag", function (shader) {
            _this.pixelShader = shader;
        }, console.error);
        main_1.gp5.loadShader("./src/shader/shader_id.vert", "./src/shader/shader.frag", function (shader) {
            _this.idShader = shader;
        }, console.error);
        main_1.gp5.loadShader("./src/shader/shader_outline.vert", "./src/shader/shader.frag", function (shader) {
            _this.outlineShader = shader;
        }, console.error);
        var geoJsonUrl = "./files/Cartographies/" + cartography;
        var _a = VGeoCluster.projectMercator(bbox[0], bbox[1]), xMin = _a[0], yMax = _a[1];
        var _b = VGeoCluster.projectMercator(bbox[2], bbox[3]), xMax = _b[0], yMin = _b[1];
        var center = main_1.gp5.createVector((xMin + xMax) / 2, (yMin + yMax) / 2);
        var scale = Math.min((VGeoCluster.width - 2 * VGeoCluster.PADDING) / (xMax - xMin), (VGeoCluster.height - 2 * VGeoCluster.PADDING) / (yMax - yMin));
        VGeoCluster.loadGeometry(geoJsonUrl, center, scale).then(function (data) {
            console.log("GEOMETRY LOADED from", geoJsonUrl);
            DOMManager_1.DOM.hideMessage();
            // store propreties of this VGeoCluster
            _this.numFeatures = data.numFeatures;
            _this.featureIndexByGeocode = data.featureIndexByGeocode;
            _this.centroidByGeocode = data.centroidByGeocode;
            _this.clusterGeometry = data.geometry;
            _this.updatePalette();
            // Refresh canvas and reposition nodes
            _this.updateMatrices();
            _this.unprojectMousePosition();
            _this.updateVNodePositions();
            // update the canvas with the new drawings
            canvas_1.Canvas.update();
        });
        var secondaryGeoJsonUrl = "./files/Cartographies/" + secondaryCartography;
        VGeoCluster.loadSecondaryGeometry(secondaryGeoJsonUrl, center, scale).then(function (data) {
            console.log("SECONDARY GEOMETRY LOADED from", secondaryGeoJsonUrl);
            DOMManager_1.DOM.hideMessage();
            _this.secondaryClusterGeometry = data.geometry;
            // Refresh canvas and reposition nodes
            _this.updateMatrices();
            _this.unprojectMousePosition();
            _this.updateVNodePositions();
            // update the canvas with the new drawings
            canvas_1.Canvas.update();
        });
        return _this;
    }
    Object.defineProperty(VGeoCluster, "width", {
        get: function () {
            return main_1.gp5.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VGeoCluster, "height", {
        get: function () {
            return main_1.gp5.height;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VGeoCluster, "pixelTarget", {
        get: function () {
            if (!this._pixelTarget) {
                this._pixelTarget = main_1.gp5.createGraphics(this.width, this.height, main_1.gp5.WEBGL);
            }
            return this._pixelTarget;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VGeoCluster, "idTarget", {
        get: function () {
            if (!this._idTarget) {
                this._idTarget = main_1.gp5.createGraphics(this.width, this.height, main_1.gp5.WEBGL);
            }
            return this._idTarget;
        },
        enumerable: false,
        configurable: true
    });
    VGeoCluster.projectMercator = function (lon, lat, center, scale) {
        if (center === void 0) { center = main_1.gp5.createVector(); }
        if (scale === void 0) { scale = 1; }
        var x = (1 / (2 * Math.PI)) * lon * (Math.PI / 180);
        var y = (1 / (2 * Math.PI)) *
            (Math.PI - Math.log(Math.tan(Math.PI / 4 + (lat * (Math.PI / 180)) / 2)));
        return [scale * (x - center.x), scale * (y - center.y)];
    };
    VGeoCluster.getCentroid = function (geom, center, scale) {
        var numPoints = 0;
        var xSum = 0;
        var ySum = 0;
        function traverse(rings) {
            if (rings.length === 0)
                return;
            for (var _i = 0, _a = rings[0]; _i < _a.length; _i++) {
                var _b = _a[_i], lon = _b[0], lat = _b[1];
                var _c = VGeoCluster.projectMercator(lon, lat, center, scale), x = _c[0], y = _c[1];
                numPoints++;
                xSum += x;
                ySum += y;
            }
        }
        if (geom.type === "Polygon") {
            traverse(geom.coordinates);
        }
        else if (geom.type === "MultiPolygon") {
            for (var _i = 0, _a = geom.coordinates; _i < _a.length; _i++) {
                var polygon = _a[_i];
                traverse(polygon);
            }
        }
        return main_1.gp5.createVector(xSum / numPoints, ySum / numPoints);
    };
    /**
     * Creates a shape from coordinates projected on the mercator projection ans stores it in the pixelTarget buffer
     * @param {*} geom
     * @param {*} center
     * @param {*} scale
     */
    VGeoCluster.drawShape = function (geom, center, scale) {
        function traverse(rings) {
            if (rings.length === 0)
                return;
            VGeoCluster.pixelTarget.beginShape();
            for (var _i = 0, _a = rings[0]; _i < _a.length; _i++) {
                var _b = _a[_i], lon = _b[0], lat = _b[1];
                var _c = VGeoCluster.projectMercator(lon, lat, center, scale), x = _c[0], y = _c[1];
                VGeoCluster.pixelTarget.vertex(x, y);
            }
            VGeoCluster.pixelTarget.endShape();
        }
        if (geom.type === "Polygon") {
            traverse(geom.coordinates);
        }
        else if (geom.type === "MultiPolygon") {
            for (var _i = 0, _a = geom.coordinates; _i < _a.length; _i++) {
                var polygon = _a[_i];
                traverse(polygon);
            }
        }
    };
    // TODO: comments
    VGeoCluster.drawOutline = function (geom, center, scale) {
        function traverse(rings) {
            if (rings.length === 0)
                return;
            var N = rings[0].length;
            for (var i = 0; i < N; ++i) {
                var _a = rings[0][i], lon1 = _a[0], lat1 = _a[1];
                var _b = rings[0][(i + 1) % N], lon2 = _b[0], lat2 = _b[1];
                var _c = VGeoCluster.projectMercator(lon1, lat1, center, scale), x1 = _c[0], y1 = _c[1];
                var _d = VGeoCluster.projectMercator(lon2, lat2, center, scale), x2 = _d[0], y2 = _d[1];
                var forward = new p5_1.default.Vector(x2 - x1, y2 - y1).normalize();
                var offset = new p5_1.default.Vector(-forward.y, forward.x).mult(1);
                VGeoCluster.pixelTarget.beginShape();
                VGeoCluster.pixelTarget.vertex(x1 + offset.x, y1 + offset.y);
                VGeoCluster.pixelTarget.vertex(x1 - offset.x, y1 - offset.y);
                VGeoCluster.pixelTarget.vertex(x2 - offset.x, y2 - offset.y);
                VGeoCluster.pixelTarget.vertex(x2 + offset.x, y2 + offset.y);
                VGeoCluster.pixelTarget.endShape();
            }
            for (var i = 0; i < N; ++i) {
                var _e = rings[0][i], lon1 = _e[0], lat1 = _e[1];
                var _f = rings[0][(i + 1) % N], lon2 = _f[0], lat2 = _f[1];
                var _g = rings[0][(i + 2) % N], lon3 = _g[0], lat3 = _g[1];
                var _h = VGeoCluster.projectMercator(lon1, lat1, center, scale), x1 = _h[0], y1 = _h[1];
                var _j = VGeoCluster.projectMercator(lon2, lat2, center, scale), x2 = _j[0], y2 = _j[1];
                var _k = VGeoCluster.projectMercator(lon3, lat3, center, scale), x3 = _k[0], y3 = _k[1];
                var forward1 = new p5_1.default.Vector(x2 - x1, y2 - y1).normalize();
                var offset1 = new p5_1.default.Vector(-forward1.y, forward1.x).mult(1);
                var forward2 = new p5_1.default.Vector(x3 - x2, y3 - y2).normalize();
                var offset2 = new p5_1.default.Vector(-forward2.y, forward2.x).mult(1);
                if (forward1.cross(forward2).z > 0) {
                    VGeoCluster.pixelTarget.beginShape();
                    VGeoCluster.pixelTarget.vertex(x2, y2);
                    VGeoCluster.pixelTarget.vertex(x2 - offset1.x, y2 - offset1.y);
                    VGeoCluster.pixelTarget.vertex(x2 - offset2.x, y2 - offset2.y);
                    VGeoCluster.pixelTarget.endShape();
                }
                else {
                    VGeoCluster.pixelTarget.beginShape();
                    VGeoCluster.pixelTarget.vertex(x2, y2);
                    VGeoCluster.pixelTarget.vertex(x2 + offset2.x, y2 + offset2.y);
                    VGeoCluster.pixelTarget.vertex(x2 + offset1.x, y2 + offset1.y);
                    VGeoCluster.pixelTarget.endShape();
                }
            }
        }
        if (geom.type === "Polygon") {
            traverse(geom.coordinates);
        }
        else if (geom.type === "MultiPolygon") {
            for (var _i = 0, _a = geom.coordinates; _i < _a.length; _i++) {
                var polygon = _a[_i];
                traverse(polygon);
            }
        }
    };
    VGeoCluster.computeCentroids = function (features, center, scale) {
        var index = {};
        for (var _i = 0, features_1 = features; _i < features_1.length; _i++) {
            var feature = features_1[_i];
            var geocode = feature.properties.GEOCODIGO;
            index[geocode] = this.getCentroid(feature.geometry, center, scale);
        }
        return index;
    };
    VGeoCluster.loadGeometry = function (url, center, scale) {
        var _this = this;
        //console.log("Loading geometry from", url);
        DOMManager_1.DOM.showMessage("Loading geometry from\n".concat(url, " ..."));
        if (!this.geometryCache[url]) {
            this.geometryCache[url] = new Promise(function (resolve) {
                main_1.gp5.loadJSON(url, function (_a) {
                    var features = _a.features;
                    var centroidByGeocode = _this.computeCentroids(features, center, scale);
                    // @ts-expect-error
                    // Error reported in: https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/72658
                    var geometry = VGeoCluster.pixelTarget.buildGeometry(function () {
                        for (var _i = 0, _a = features.entries(); _i < _a.length; _i++) {
                            var _b = _a[_i], i = _b[0], feature = _b[1];
                            VGeoCluster.pixelTarget.noStroke();
                            VGeoCluster.pixelTarget.fill(0, // ((i + 1) >> 16) & 0xff,
                            ((i + 1) >> 8) & 0xff, ((i + 1) >> 0) & 0xff);
                            _this.drawShape(feature.geometry, center, scale);
                        }
                    });
                    var featureIndexByGeocode = {};
                    for (var _i = 0, _b = features.entries(); _i < _b.length; _i++) {
                        var _c = _b[_i], i = _c[0], feature = _c[1];
                        featureIndexByGeocode[feature.properties.GEOCODIGO] = i;
                    }
                    resolve({
                        numFeatures: features.length,
                        featureIndexByGeocode: featureIndexByGeocode,
                        centroidByGeocode: centroidByGeocode,
                        geometry: geometry,
                    });
                }, function (err) {
                    console.error(err), DOMManager_1.DOM.showMessage("Wrong URL\n".concat(url, " ..."));
                });
            });
        }
        return this.geometryCache[url];
    };
    VGeoCluster.loadSecondaryGeometry = function (url, center, scale) {
        var _this = this;
        //console.log("Loading geometry from", url);
        DOMManager_1.DOM.showMessage("Loading secondary geometry from\n".concat(url, " ..."));
        if (!this.geometryCache[url]) {
            this.geometryCache[url] = new Promise(function (resolve) {
                main_1.gp5.loadJSON(url, function (_a) {
                    var features = _a.features;
                    var centroidByGeocode = _this.computeCentroids(features, center, scale);
                    // @ts-expect-error
                    // Error reported in: https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/72658
                    var geometry = VGeoCluster.pixelTarget.buildGeometry(function () {
                        for (var _i = 0, _a = features.entries(); _i < _a.length; _i++) {
                            var _b = _a[_i], i = _b[0], feature = _b[1];
                            VGeoCluster.pixelTarget.noStroke();
                            VGeoCluster.pixelTarget.fill(128, 128, 128);
                            _this.drawOutline(feature.geometry, center, scale);
                        }
                    });
                    var featureIndexByGeocode = {};
                    for (var _i = 0, _b = features.entries(); _i < _b.length; _i++) {
                        var _c = _b[_i], i = _c[0], feature = _c[1];
                        featureIndexByGeocode[feature.properties.GEOCODIGO] = i;
                    }
                    resolve({
                        numFeatures: features.length,
                        featureIndexByGeocode: featureIndexByGeocode,
                        centroidByGeocode: centroidByGeocode,
                        geometry: geometry,
                    });
                }, function (err) {
                    console.error(err), DOMManager_1.DOM.showMessage("Wrong URL\n".concat(url, " ..."));
                });
            });
        }
        return this.geometryCache[url];
    };
    VGeoCluster.detectHitAsync = function () {
        var _this = this;
        var gl = this.idTarget.drawingContext;
        var sampleCount = 2;
        var x = canvas_1.Canvas._mouse.x * sampleCount;
        var y = (VGeoCluster.height - canvas_1.Canvas._mouse.y) * sampleCount;
        var idPBO = gl.createBuffer();
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, idPBO);
        gl.bufferData(gl.PIXEL_PACK_BUFFER, 4, gl.STREAM_READ);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, 0);
        var sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        var checkSyncStatus = function () {
            switch (gl.clientWaitSync(sync, 0, 0)) {
                case gl.WAIT_FAILED:
                    return;
                case gl.TIMEOUT_EXPIRED:
                    setTimeout(checkSyncStatus, 5);
                    return;
                default:
                    gl.deleteSync(sync);
                    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, idPBO);
                    gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, _this.idBuffer);
                    gl.deleteBuffer(idPBO);
                    _this.selectedLayerId = _this.idBuffer[0] - 1;
                    _this.selectedFeatureId = (_this.idBuffer[1] << 8) | _this.idBuffer[2];
            }
        };
        checkSyncStatus();
    };
    VGeoCluster.applyZoom = function (direction) {
        for (var _i = 0, _a = this.all; _i < _a.length; _i++) {
            var vCluster = _a[_i];
            vCluster.scale *= vCluster.zoomDirection == direction ? 1.02 : 0.98;
        }
    };
    VGeoCluster.prototype.updatePalette = function () {
        var _a, _b;
        if (!this.timestamp || !this.dimension)
            return;
        this._palette = main_1.gp5.createImage(this.numFeatures, 1);
        this._palette.loadPixels();
        var min = Infinity;
        var max = -Infinity;
        for (var _i = 0, _c = this.vNodes; _i < _c.length; _i++) {
            var vNode = _c[_i];
            var attributes = vNode.node.attributes;
            for (var _d = 0, _e = Object.values(attributes === null || attributes === void 0 ? void 0 : attributes.attAll); _d < _e.length; _d++) {
                var attrs = _e[_d];
                var value = attrs[this.dimension];
                if (value !== undefined && value !== -1) {
                    min = Math.min(min, Number(value));
                    max = Math.max(max, Number(value));
                }
            }
        }
        if (min === Infinity || max === -Infinity)
            return;
        var scale = chroma_js_1.default
            .scale(this.paletteByDimension[this.dimension])
            .domain([this.scalarTransform(1), this.scalarTransform(max - min + 1)]);
        for (var i = 0; i < this.numFeatures; ++i) {
            this._palette.set(i, 0, __spreadArray(__spreadArray([], scale(min).rgb(), true), [255], false));
        }
        for (var _f = 0, _g = this.vNodes; _f < _g.length; _f++) {
            var vNode = _g[_f];
            var attributes = vNode.node.attributes;
            var geocode = attributes === null || attributes === void 0 ? void 0 : attributes.attGeo["geocode"];
            var featureIndex = this.featureIndexByGeocode[geocode];
            if (!featureIndex)
                continue;
            var value = this.scalarTransform(Number((_b = (_a = attributes === null || attributes === void 0 ? void 0 : attributes.attAll) === null || _a === void 0 ? void 0 : _a[this.timestamp]) === null || _b === void 0 ? void 0 : _b[this.dimension]) -
                min +
                1);
            this._palette.set(featureIndex, 0, value === -1 ? [0, 0, 0, 0] : __spreadArray(__spreadArray([], scale(value).rgb(), true), [255], false));
        }
        this._palette.updatePixels();
    };
    VGeoCluster.prototype.warp = function (r) {
        if (r < this.r1)
            return this.s1 * r;
        if (r < this.r2) {
            return (this.s1 * r +
                ((this.s1 - this.s2) * (r - this.r1) * (r - this.r1)) /
                    (2.0 * (this.r1 - this.r2)));
        }
        return (this.s1 * this.r2 +
            ((this.s2 - this.s1) * (this.r2 - this.r1)) / 2.0 +
            this.s2 * (r - this.r2));
    };
    VGeoCluster.prototype.updateMatrices = function () {
        var flipY = mat4.fromValues(this.scale, 0, 0, 0, 0, -this.scale, 0, 0, 0, 0, this.scale, 0, 0, 0, 0, 1);
        var visibleIndex = VGeoCluster.visible.indexOf(this);
        var zOffset = this.layerGap *
            ((VGeoCluster.all.length - 1) / 2 -
                visibleIndex -
                this.layerIndexInFocus);
        var xOffset = -1 * zOffset;
        var yOffset = 0;
        var offset = vec3.fromValues(xOffset, yOffset, zOffset);
        var translate = mat4.fromTranslation(mat4.create(), offset);
        var rotateX = mat4.fromXRotation(mat4.create(), this.rotationX);
        var rotateY = mat4.fromYRotation(mat4.create(), this.rotationY);
        var modelMatrix = mat4.create();
        mat4.mul(modelMatrix, translate, flipY);
        mat4.mul(modelMatrix, rotateX, modelMatrix);
        mat4.mul(modelMatrix, rotateY, modelMatrix);
        var viewMatrix = mat4.lookAt(mat4.create(), [0, 0, this.cameraDistance], [0, 0, 0], [0, 1, 0]);
        this.modelViewMatrix = mat4.mul(mat4.create(), viewMatrix, modelMatrix);
        this.projectionMatrix = mat4.perspective(mat4.create(), 2 * Math.atan(this.tanHalfFovY), // vertical FOV
        VGeoCluster.width / VGeoCluster.height, // aspect ratio
        0.1 * 800, // near plane
        10 * 800);
    };
    Object.defineProperty(VGeoCluster.prototype, "focusRadius", {
        get: function () {
            return this.s1 * this.r2;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Update the position of the VNodes and each of its vConnectors based on the current rotation and zoom level
     * *************** TODO This method should be modified and use the TransFactory class.***************
     */
    VGeoCluster.prototype.updateVNodePositions = function () {
        //This matrix should be stored in the TransFactory class
        var MVP = mat4.create();
        mat4.mul(MVP, this.projectionMatrix, this.modelViewMatrix);
        for (var _i = 0, _a = this.vNodes; _i < _a.length; _i++) {
            var vNode = _a[_i];
            var geocode = vNode.node.attributes.attGeo.geocode;
            if (!this.centroidByGeocode[geocode])
                continue;
            var vIn = this.centroidByGeocode[geocode].copy();
            vIn.sub(this.mouseX_object, this.mouseY_object);
            var r = this.warp(vIn.mag());
            vIn.setMag(r);
            vIn.add(this.mouseX_object, this.mouseY_object);
            var position_object = vec4.fromValues(vIn.x, vIn.y, 0, 1);
            var position_NDC = vec4.transformMat4(vec4.create(), position_object, MVP);
            vNode.shouldShowText = r < this.focusRadius && r < this.focusRadius;
            vNode.shouldShowButton =
                r < this.focusRadius && this.index === VGeoCluster.selectedLayerId;
            vNode.pos = main_1.gp5
                .createVector(position_NDC[0] / position_NDC[3], position_NDC[1] / position_NDC[3], position_NDC[3])
                .mult(VGeoCluster.width / 2, -VGeoCluster.height / 2)
                .add(VGeoCluster.width / 2, VGeoCluster.height / 2);
            // Update the internal connectors
            vNode.updateConnectorsCoords();
        }
    };
    /**
     * Determine mouse coordinates in the map plane (object space) using ray casting.
     * The result is stored in internal properties this.mouseX_object and this.mouseY_object
     */
    VGeoCluster.prototype.unprojectMousePosition = function () {
        var normal = vec4.fromValues(0, 0, 1, 0); // direction (w=0)
        var center = vec4.fromValues(0, 0, 0, 1); // position (w=1)
        vec4.transformMat4(normal, normal, this.modelViewMatrix);
        vec4.transformMat4(center, center, this.modelViewMatrix);
        var ray = vec4.fromValues(canvas_1.Canvas._mouse.x - VGeoCluster.width / 2, -(canvas_1.Canvas._mouse.y - VGeoCluster.height / 2), -(VGeoCluster.height / 2 / this.tanHalfFovY), 0);
        var signedDistance = vec4.dot(ray, normal);
        if (signedDistance >= 0) {
            // if the ray is directed away from the plane, adjust it slightly to make it directed towards the plane
            vec4.scaleAndAdd(ray, ray, normal, -(signedDistance + 0.1));
        }
        var t = vec4.dot(center, normal) / vec4.dot(ray, normal);
        var pos_camera = vec4.fromValues(ray[0] * t, ray[1] * t, ray[2] * t, 1);
        var modelViewInverse = mat4.invert(mat4.create(), this.modelViewMatrix);
        var pos_object = vec4.transformMat4(vec4.create(), pos_camera, modelViewInverse);
        this.mouseX_object = pos_object[0] / pos_object[3];
        this.mouseY_object = pos_object[1] / pos_object[3];
    };
    /**
     * Receives events from the canvas and updates the VGeoCluster accordingly.
     * This replaces the former handleEvents method in this class.
     * @param {*} data the event sent by the canvas to its observers.
     */
    VGeoCluster.prototype.fromCanvas = function (data) {
        if (data.event instanceof MouseEvent) {
            this.updateMatrices();
            this.unprojectMousePosition();
            this.updateVNodePositions();
        }
        else if (data.event instanceof KeyboardEvent) {
            if (data.event.type == "keydown") {
                switch (data.event.key) {
                    case "ArrowUp":
                        this.rotationX = main_1.gp5.constrain(this.rotationX - 0.05, -Math.PI / 2, Math.PI / 2);
                        break;
                    case "ArrowDown":
                        this.rotationX = main_1.gp5.constrain(this.rotationX + 0.05, -Math.PI / 2, Math.PI / 2);
                        break;
                    case "ArrowLeft":
                        this.rotationY = main_1.gp5.constrain(this.rotationY - 0.05, -Math.PI / 2, Math.PI / 2);
                        break;
                    case "ArrowRight":
                        this.rotationY = main_1.gp5.constrain(this.rotationY + 0.05, -Math.PI / 2, Math.PI / 2);
                        break;
                    case ",":
                        this.layerIndexInFocus -= 0.1;
                        break;
                    case ".":
                        this.layerIndexInFocus += 0.1;
                        break;
                    case "=":
                        this.s1 = main_1.gp5.constrain(this.s1 + 1, 1, 50);
                        break;
                    case "-":
                        this.s1 = main_1.gp5.constrain(this.s1 - 1, 1, 50);
                        break;
                    case "k":
                        this.layerGap += 10;
                        break;
                    case "j":
                        this.layerGap -= 10;
                        break;
                    default:
                }
                this.updateMatrices();
                this.unprojectMousePosition();
                this.updateVNodePositions();
                return true;
            }
        }
        else {
            // do something
        }
        return false;
    };
    VGeoCluster.prototype.highlight = function (vNode) {
        var attributes = vNode.node.attributes;
        var geocode = attributes === null || attributes === void 0 ? void 0 : attributes.attGeo["geocode"];
        var featureIndex = this.featureIndexByGeocode[geocode];
        VGeoCluster.selectedLayerId = this.index;
        console.log(featureIndex);
        VGeoCluster.selectedFeatureId = featureIndex;
    };
    VGeoCluster.prototype.renderToBuffer = function (buffer, geometry, shader) {
        buffer.shader(shader);
        shader.setUniform("modelViewMatrix", __spreadArray([], this.modelViewMatrix, true));
        shader.setUniform("projectionMatrix", __spreadArray([], this.projectionMatrix, true));
        shader.setUniform("mouse", [this.mouseX_object, this.mouseY_object]);
        shader.setUniform("layerId", this.index + 1);
        shader.setUniform("r1", this.r1);
        shader.setUniform("r2", this.r2);
        shader.setUniform("s1", this.s1);
        shader.setUniform("s2", this.s2);
        shader.setUniform("palette", this._palette);
        shader.setUniform("paletteSize", this._palette.width);
        shader.setUniform("selected", VGeoCluster.selectedFeatureId);
        buffer.model(geometry);
    };
    VGeoCluster.prototype.show = function (renderer) {
        if (!this.visible)
            return;
        // super.show(renderer);
        // this.handleEvents();
        if (this.clusterGeometry && this.secondaryClusterGeometry) {
            if (this.pixelShader) {
                VGeoCluster.pixelTarget.texture(this._palette);
                this.renderToBuffer(VGeoCluster.pixelTarget, this.clusterGeometry, this.pixelShader);
            }
            if (this.outlineShader) {
                // TODO: comments
                VGeoCluster.pixelTarget.fill(0);
                this.renderToBuffer(VGeoCluster.pixelTarget, this.secondaryClusterGeometry, this.outlineShader);
            }
            if (this.idShader) {
                this.renderToBuffer(VGeoCluster.idTarget, this.clusterGeometry, this.idShader);
            }
        }
    };
    VGeoCluster.all = [];
    VGeoCluster.visible = [];
    VGeoCluster.scalarTransforms = {
        linear: function (v) { return v; },
        log: Math.log10,
        sqrt: Math.sqrt,
    };
    VGeoCluster.geometryCache = {};
    VGeoCluster.PADDING = 300;
    VGeoCluster.idBuffer = new Uint8Array(4);
    VGeoCluster.selectedLayerId = 0;
    VGeoCluster.selectedFeatureId = 0;
    return VGeoCluster;
}(vCluster_1.VCluster));
exports.VGeoCluster = VGeoCluster;
