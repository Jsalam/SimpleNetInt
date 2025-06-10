import * as glMatrix from "gl-matrix";
import { gp5 } from "../main";
import p5, { Vector } from "p5";
import chroma from "chroma-js";
import { DOM } from "../GUI/DOM/DOMManager";
import { Canvas } from "../canvas/canvas";
import { Cluster } from "../graphElements/cluster";
import { VCluster } from "./vCluster";
import { Feature, FeatureCollection, Geometry, Position } from "geojson";
import { CustomEvent } from "../types";
import { ClusterFactory } from "../factories/clusterFactory";

const { mat4, vec4, vec3 } = glMatrix;

type GeometryCache = {
  numFeatures: number;
  featureIndexByGeocode: Record<string, number>;
  centroidByGeocode: Record<string, Vector>;
  geometry: p5.Geometry;
};

export class VGeoCluster extends VCluster {
  static all: VGeoCluster[] = [];
  static visible: VGeoCluster[] = [];

  static scalarTransforms: Record<
    "linear" | "log" | "sqrt",
    (v: number) => number
  > = {
    linear: (v) => v,
    log: Math.log10,
    sqrt: Math.sqrt,
  };

  static _pixelTarget: p5.Graphics;
  static _idTarget: p5.Graphics;
  static geometryCache: Record<string, Promise<GeometryCache>> = {};

  static PADDING = 300;

  static get width() {
    return gp5.width;
  }

  static get height() {
    return gp5.height;
  }

  static get pixelTarget() {
    if (!this._pixelTarget) {
      this._pixelTarget = gp5.createGraphics(
        this.width,
        this.height,
        gp5.WEBGL,
      );
    }
    return this._pixelTarget;
  }

  static get idTarget() {
    if (!this._idTarget) {
      this._idTarget = gp5.createGraphics(this.width, this.height, gp5.WEBGL);
    }
    return this._idTarget;
  }

  static projectMercator(
    lon: number,
    lat: number,
    center = gp5.createVector(),
    scale = 1,
  ) {
    const x = (1 / (2 * Math.PI)) * lon * (Math.PI / 180);
    const y =
      (1 / (2 * Math.PI)) *
      (Math.PI - Math.log(Math.tan(Math.PI / 4 + (lat * (Math.PI / 180)) / 2)));
    return [scale * (x - center.x), scale * (y - center.y)];
  }

  static getCentroid(geom: Geometry, center: Vector, scale: number) {
    let numPoints = 0;
    let xSum = 0;
    let ySum = 0;

    function traverse(rings: Position[][]) {
      if (rings.length === 0) return;
      for (let [lon, lat] of rings[0]) {
        const [x, y] = VGeoCluster.projectMercator(lon, lat, center, scale);
        numPoints++;
        xSum += x;
        ySum += y;
      }
    }

    if (geom.type === "Polygon") {
      traverse(geom.coordinates);
    } else if (geom.type === "MultiPolygon") {
      for (const polygon of geom.coordinates) {
        traverse(polygon);
      }
    }
    return gp5.createVector(xSum / numPoints, ySum / numPoints);
  }

  /**
   * Creates a shape from coordinates projected on the mercator projection ans stores it in the pixelTarget buffer
   * @param {*} geom
   * @param {*} center
   * @param {*} scale
   */
  static drawShape(geom: Geometry, center: Vector, scale: number) {
    function traverse(rings: Position[][]) {
      if (rings.length === 0) return;
      VGeoCluster.pixelTarget.beginShape();
      for (let [lon, lat] of rings[0]) {
        const [x, y] = VGeoCluster.projectMercator(lon, lat, center, scale);
        VGeoCluster.pixelTarget.vertex(x, y);
      }
      VGeoCluster.pixelTarget.endShape();
    }

    if (geom.type === "Polygon") {
      traverse(geom.coordinates);
    } else if (geom.type === "MultiPolygon") {
      for (const polygon of geom.coordinates) {
        traverse(polygon);
      }
    }
  }

  // TODO: comments
  static drawOutline(geom: Geometry, center: Vector, scale: number) {
    function traverse(rings: Position[][]) {
      if (rings.length === 0) return;
      const N = rings[0].length;
      for (let i = 0; i < N; ++i) {
        const [lon1, lat1] = rings[0][i];
        const [lon2, lat2] = rings[0][(i + 1) % N];

        const [x1, y1] = VGeoCluster.projectMercator(lon1, lat1, center, scale);
        const [x2, y2] = VGeoCluster.projectMercator(lon2, lat2, center, scale);
        const forward = new p5.Vector(x2 - x1, y2 - y1).normalize();
        const offset = new p5.Vector(-forward.y, forward.x).mult(1);

        VGeoCluster.pixelTarget.beginShape();
        VGeoCluster.pixelTarget.vertex(x1 + offset.x, y1 + offset.y);
        VGeoCluster.pixelTarget.vertex(x1 - offset.x, y1 - offset.y);
        VGeoCluster.pixelTarget.vertex(x2 - offset.x, y2 - offset.y);
        VGeoCluster.pixelTarget.vertex(x2 + offset.x, y2 + offset.y);
        VGeoCluster.pixelTarget.endShape();
      }
      for (let i = 0; i < N; ++i) {
        const [lon1, lat1] = rings[0][i];
        const [lon2, lat2] = rings[0][(i + 1) % N];
        const [lon3, lat3] = rings[0][(i + 2) % N];

        const [x1, y1] = VGeoCluster.projectMercator(lon1, lat1, center, scale);
        const [x2, y2] = VGeoCluster.projectMercator(lon2, lat2, center, scale);
        const [x3, y3] = VGeoCluster.projectMercator(lon3, lat3, center, scale);
        const forward1 = new p5.Vector(x2 - x1, y2 - y1).normalize();
        const offset1 = new p5.Vector(-forward1.y, forward1.x).mult(1);
        const forward2 = new p5.Vector(x3 - x2, y3 - y2).normalize();
        const offset2 = new p5.Vector(-forward2.y, forward2.x).mult(1);
        if (forward1.cross(forward2).z > 0) {
          VGeoCluster.pixelTarget.beginShape();
          VGeoCluster.pixelTarget.vertex(x2, y2);
          VGeoCluster.pixelTarget.vertex(x2 - offset1.x, y2 - offset1.y);
          VGeoCluster.pixelTarget.vertex(x2 - offset2.x, y2 - offset2.y);
          VGeoCluster.pixelTarget.endShape();
        } else {
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
    } else if (geom.type === "MultiPolygon") {
      for (const polygon of geom.coordinates) {
        traverse(polygon);
      }
    }
  }

  static computeCentroids(features: Feature[], center: Vector, scale: number) {
    const index: Record<string, Vector> = {};
    for (const feature of features) {
      const geocode = feature.properties!.GEOCODIGO;
      index[geocode] = this.getCentroid(feature.geometry, center, scale);
    }
    return index;
  }

  static loadGeometry(url: string, center: Vector, scale: number) {
    //console.log("Loading geometry from", url);
    DOM.showMessage(`Loading geometry from\n${url} ...`);
    if (!this.geometryCache[url]) {
      this.geometryCache[url] = new Promise<GeometryCache>((resolve) => {
        gp5.loadJSON(
          url,
          ({ features }: FeatureCollection) => {
            const centroidByGeocode = this.computeCentroids(
              features,
              center,
              scale,
            );
            // @ts-expect-error
            // Error reported in: https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/72658
            const geometry: p5.Geometry = VGeoCluster.pixelTarget.buildGeometry(
              () => {
                for (let [i, feature] of features.entries()) {
                  VGeoCluster.pixelTarget.noStroke();
                  VGeoCluster.pixelTarget.fill(
                    0, // ((i + 1) >> 16) & 0xff,
                    ((i + 1) >> 8) & 0xff,
                    ((i + 1) >> 0) & 0xff,
                  );
                  this.drawShape(feature.geometry, center, scale);
                }
              },
            );

            const featureIndexByGeocode: Record<string, number> = {};
            for (let [i, feature] of features.entries()) {
              featureIndexByGeocode[feature.properties!.GEOCODIGO] = i;
            }

            resolve({
              numFeatures: features.length,
              featureIndexByGeocode,
              centroidByGeocode,
              geometry,
            });
          },
          (err) => {
            console.error(err), DOM.showMessage(`Wrong URL\n${url} ...`);
          },
        );
      });
    }
    return this.geometryCache[url];
  }

  static loadSecondaryGeometry(url: string, center: Vector, scale: number) {
    //console.log("Loading geometry from", url);
    DOM.showMessage(`Loading secondary geometry from\n${url} ...`);
    if (!this.geometryCache[url]) {
      this.geometryCache[url] = new Promise<GeometryCache>((resolve) => {
        gp5.loadJSON(
          url,
          ({ features }: FeatureCollection) => {
            const centroidByGeocode = this.computeCentroids(
              features,
              center,
              scale,
            );
            // @ts-expect-error
            // Error reported in: https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/72658
            const geometry: p5.Geometry = VGeoCluster.pixelTarget.buildGeometry(
              () => {
                for (let [i, feature] of features.entries()) {
                  VGeoCluster.pixelTarget.noStroke();
                  VGeoCluster.pixelTarget.fill(128, 128, 128);
                  this.drawOutline(feature.geometry, center, scale);
                }
              },
            );

            const featureIndexByGeocode: Record<string, number> = {};
            for (let [i, feature] of features.entries()) {
              featureIndexByGeocode[feature.properties!.GEOCODIGO] = i;
            }

            resolve({
              numFeatures: features.length,
              featureIndexByGeocode,
              centroidByGeocode,
              geometry,
            });
          },
          (err) => {
            console.error(err), DOM.showMessage(`Wrong URL\n${url} ...`);
          },
        );
      });
    }
    return this.geometryCache[url];
  }

  static idBuffer = new Uint8Array(4);
  static selectedLayerId = 0;
  static selectedFeatureId = 0;

  static detectHitAsync() {
    const gl = this.idTarget.drawingContext;
    const sampleCount = 2;
    const x = Canvas._mouse.x * sampleCount;
    const y = (VGeoCluster.height - Canvas._mouse.y) * sampleCount;
    const idPBO = gl.createBuffer();
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, idPBO);
    gl.bufferData(gl.PIXEL_PACK_BUFFER, 4, gl.STREAM_READ);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, 0);

    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    const checkSyncStatus = () => {
      switch (gl.clientWaitSync(sync, 0, 0)) {
        case gl.WAIT_FAILED:
          return;
        case gl.TIMEOUT_EXPIRED:
          setTimeout(checkSyncStatus, 5);
          return;
        default:
          gl.deleteSync(sync);
          gl.bindBuffer(gl.PIXEL_PACK_BUFFER, idPBO);
          gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, this.idBuffer);
          gl.deleteBuffer(idPBO);
          this.selectedLayerId = this.idBuffer[0] - 1;
          this.selectedFeatureId = (this.idBuffer[1] << 8) | this.idBuffer[2];
      }
    };
    checkSyncStatus();
  }

  static applyZoom(direction: 1 | -1) {
    for (const vCluster of this.all) {
      vCluster.scale *= vCluster.zoomDirection == direction ? 1.02 : 0.98;
    }
  }

  numFeatures = 1;
  featureIndexByGeocode: Record<string, number> = {};
  centroidByGeocode: Record<string, Vector> = {};
  clusterGeometry: p5.Geometry | null = null;
  secondaryClusterGeometry: p5.Geometry | null = null;
  pixelShader: p5.Shader | null = null;
  idShader: p5.Shader | null = null;
  outlineShader: p5.Shader | null = null;

  r1 = 10;
  r2 = 15;
  s1 = 1;
  s2 = 1;

  layerIndexInFocus = 0;
  layerGap = 1;
  rotationX = 0;
  rotationY = 0;
  cameraDistance = 900;

  // tangent of 1/2 vertical field-of-view
  tanHalfFovY = VGeoCluster.height / 2 / this.cameraDistance;

  modelViewMatrix = mat4.create();
  projectionMatrix = mat4.create();

  _palette = gp5.createImage(1, 1);

  mouseX_object: number | undefined;
  mouseY_object: number | undefined;

  index: number;
  scale: 1 | -1 = 1;
  zoomDirection = 1;
  scalarTransform = VGeoCluster.scalarTransforms.linear;

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
  constructor(
    cluster: Cluster,
    posX: number,
    posY: number,
    width: number,
    height: number,
    palette: string[],
    bbox: [number, number, number, number],
    cartography: string,
    secondaryCartography: string,
    private paletteByDimension: Record<string, [string, string]>,
  ) {
    super(cluster, posX, posY, width, height, palette);

    VGeoCluster.all.push(this);
    VGeoCluster.visible.push(this);

    this.index = ClusterFactory.vClusters.length;

    gp5.loadShader(
      "./src/shader/shader_color.vert",
      "./src/shader/shader.frag",
      (shader) => {
        this.pixelShader = shader;
      },
      console.error,
    );

    gp5.loadShader(
      "./src/shader/shader_id.vert",
      "./src/shader/shader.frag",
      (shader) => {
        this.idShader = shader;
      },
      console.error,
    );

    gp5.loadShader(
      "./src/shader/shader_outline.vert",
      "./src/shader/shader.frag",
      (shader) => {
        this.outlineShader = shader;
      },
      console.error,
    );

    const geoJsonUrl = "./files/Cartographies/" + cartography;

    const [xMin, yMax] = VGeoCluster.projectMercator(bbox[0], bbox[1]);
    const [xMax, yMin] = VGeoCluster.projectMercator(bbox[2], bbox[3]);

    const center = gp5.createVector((xMin + xMax) / 2, (yMin + yMax) / 2);

    const scale = Math.min(
      (VGeoCluster.width - 2 * VGeoCluster.PADDING) / (xMax - xMin),
      (VGeoCluster.height - 2 * VGeoCluster.PADDING) / (yMax - yMin),
    );

    VGeoCluster.loadGeometry(geoJsonUrl, center, scale).then((data) => {
      console.log("GEOMETRY LOADED from", geoJsonUrl);
      DOM.hideMessage();

      // store propreties of this VGeoCluster
      this.numFeatures = data.numFeatures;
      this.featureIndexByGeocode = data.featureIndexByGeocode;
      this.centroidByGeocode = data.centroidByGeocode;
      this.clusterGeometry = data.geometry;

      this.updatePalette();

      // Refresh canvas and reposition nodes
      this.updateMatrices();
      this.unprojectMousePosition();
      this.updateVNodePositions();

      // update the canvas with the new drawings
      Canvas.update();
    });

    const secondaryGeoJsonUrl = "./files/Cartographies/" + secondaryCartography;

    VGeoCluster.loadSecondaryGeometry(secondaryGeoJsonUrl, center, scale).then(
      (data) => {
        console.log("SECONDARY GEOMETRY LOADED from", secondaryGeoJsonUrl);
        DOM.hideMessage();

        this.secondaryClusterGeometry = data.geometry;

        // Refresh canvas and reposition nodes
        this.updateMatrices();
        this.unprojectMousePosition();
        this.updateVNodePositions();

        // update the canvas with the new drawings
        Canvas.update();
      },
    );
  }

  override updatePalette() {
    if (!this.timestamp || !this.dimension) return;
    this._palette = gp5.createImage(this.numFeatures, 1);
    this._palette.loadPixels();

    let min = Infinity;
    let max = -Infinity;
    for (const vNode of this.vNodes) {
      const attributes = vNode.node.attributes;
      for (const attrs of Object.values(attributes?.attAll!)) {
        const value = attrs[this.dimension];
        if (value !== undefined && value !== -1) {
          min = Math.min(min, Number(value));
          max = Math.max(max, Number(value));
        }
      }
    }
    if (min === Infinity || max === -Infinity) return;

    const scale = chroma
      .scale(this.paletteByDimension[this.dimension])
      .domain([this.scalarTransform(1), this.scalarTransform(max - min + 1)]);

    for (let i = 0; i < this.numFeatures; ++i) {
      this._palette.set(i, 0, [...scale(min).rgb(), 255]);
    }

    for (const vNode of this.vNodes) {
      const attributes = vNode.node.attributes;
      const geocode = attributes?.attGeo!["geocode"];
      const featureIndex = this.featureIndexByGeocode[geocode];
      if (!featureIndex) continue;
      const value = this.scalarTransform(
        Number(attributes?.attAll?.[this.timestamp]?.[this.dimension]) -
          min +
          1,
      );
      this._palette.set(
        featureIndex,
        0,
        value === -1 ? [0, 0, 0, 0] : [...scale(value).rgb(), 255],
      );
    }
    this._palette.updatePixels();
  }

  warp(r: number) {
    if (r < this.r1) return this.s1 * r;
    if (r < this.r2) {
      return (
        this.s1 * r +
        ((this.s1 - this.s2) * (r - this.r1) * (r - this.r1)) /
          (2.0 * (this.r1 - this.r2))
      );
    }
    return (
      this.s1 * this.r2 +
      ((this.s2 - this.s1) * (this.r2 - this.r1)) / 2.0 +
      this.s2 * (r - this.r2)
    );
  }

  updateMatrices() {
    const flipY = mat4.fromValues(
      this.scale,
      0,
      0,
      0,
      0,
      -this.scale,
      0,
      0,
      0,
      0,
      this.scale,
      0,
      0,
      0,
      0,
      1,
    );

    const visibleIndex = VGeoCluster.visible.indexOf(this);

    const zOffset =
      this.layerGap *
      ((VGeoCluster.all.length - 1) / 2 -
        visibleIndex -
        this.layerIndexInFocus);

    const xOffset = -1 * zOffset;
    const yOffset = 0;

    const offset = vec3.fromValues(xOffset, yOffset, zOffset);
    const translate = mat4.fromTranslation(mat4.create(), offset);
    const rotateX = mat4.fromXRotation(mat4.create(), this.rotationX);
    const rotateY = mat4.fromYRotation(mat4.create(), this.rotationY);
    const modelMatrix = mat4.create();
    mat4.mul(modelMatrix, translate, flipY);
    mat4.mul(modelMatrix, rotateX, modelMatrix);
    mat4.mul(modelMatrix, rotateY, modelMatrix);
    const viewMatrix = mat4.lookAt(
      mat4.create(),
      [0, 0, this.cameraDistance],
      [0, 0, 0],
      [0, 1, 0],
    );
    this.modelViewMatrix = mat4.mul(mat4.create(), viewMatrix, modelMatrix);
    this.projectionMatrix = mat4.perspective(
      mat4.create(),
      2 * Math.atan(this.tanHalfFovY), // vertical FOV
      VGeoCluster.width / VGeoCluster.height, // aspect ratio
      0.1 * 800, // near plane
      10 * 800, // far plane
    );
  }

  get focusRadius() {
    return this.s1 * this.r2;
  }

  /**
   * Update the position of the VNodes and each of its vConnectors based on the current rotation and zoom level
   * *************** TODO This method should be modified and use the TransFactory class.***************
   */
  updateVNodePositions() {
    //This matrix should be stored in the TransFactory class
    const MVP = mat4.create();
    mat4.mul(MVP, this.projectionMatrix, this.modelViewMatrix);

    for (let vNode of this.vNodes) {
      const geocode = vNode.node.attributes!.attGeo!.geocode;
      if (!this.centroidByGeocode[geocode]) continue;

      const vIn = this.centroidByGeocode[geocode].copy();
      vIn.sub(this.mouseX_object!, this.mouseY_object);
      const r = this.warp(vIn.mag());
      vIn.setMag(r);
      vIn.add(this.mouseX_object!, this.mouseY_object);
      const position_object = vec4.fromValues(vIn.x, vIn.y, 0, 1);

      const position_NDC = vec4.transformMat4(
        vec4.create(),
        position_object,
        MVP,
      );

      vNode.shouldShowText = r < this.focusRadius && r < this.focusRadius;
      vNode.shouldShowButton =
        r < this.focusRadius && this.index === VGeoCluster.selectedLayerId;

      vNode.pos = gp5
        .createVector(
          position_NDC[0] / position_NDC[3],
          position_NDC[1] / position_NDC[3],
          position_NDC[3],
        )
        .mult(VGeoCluster.width / 2, -VGeoCluster.height / 2)
        .add(VGeoCluster.width / 2, VGeoCluster.height / 2);

      // Update the internal connectors
      vNode.updateConnectorsCoords();
    }
  }

  /**
   * Determine mouse coordinates in the map plane (object space) using ray casting.
   * The result is stored in internal properties this.mouseX_object and this.mouseY_object
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
      0,
    );
    const signedDistance = vec4.dot(ray, normal);
    if (signedDistance >= 0) {
      // if the ray is directed away from the plane, adjust it slightly to make it directed towards the plane
      vec4.scaleAndAdd(ray, ray, normal, -(signedDistance + 0.1));
    }
    const t = vec4.dot(center, normal) / vec4.dot(ray, normal);
    const pos_camera = vec4.fromValues(ray[0] * t, ray[1] * t, ray[2] * t, 1);
    const modelViewInverse = mat4.invert(mat4.create(), this.modelViewMatrix);
    const pos_object = vec4.transformMat4(
      vec4.create(),
      pos_camera,
      modelViewInverse,
    );
    this.mouseX_object = pos_object[0] / pos_object[3];
    this.mouseY_object = pos_object[1] / pos_object[3];
  }

  /**
   * Receives events from the canvas and updates the VGeoCluster accordingly.
   * This replaces the former handleEvents method in this class.
   * @param {*} data the event sent by the canvas to its observers.
   */
  fromCanvas(data: CustomEvent) {
    if (data.event instanceof MouseEvent) {
      this.updateMatrices();
      this.unprojectMousePosition();
      this.updateVNodePositions();
    } else if (data.event instanceof KeyboardEvent) {
      if (data.event.type == "keydown") {
        switch (data.event.key) {
          case "ArrowUp":
            this.rotationX = gp5.constrain(
              this.rotationX - 0.05,
              -Math.PI / 2,
              Math.PI / 2,
            );
            break;
          case "ArrowDown":
            this.rotationX = gp5.constrain(
              this.rotationX + 0.05,
              -Math.PI / 2,
              Math.PI / 2,
            );
            break;
          case "ArrowLeft":
            this.rotationY = gp5.constrain(
              this.rotationY - 0.05,
              -Math.PI / 2,
              Math.PI / 2,
            );
            break;
          case "ArrowRight":
            this.rotationY = gp5.constrain(
              this.rotationY + 0.05,
              -Math.PI / 2,
              Math.PI / 2,
            );
            break;
          case ",":
            this.layerIndexInFocus -= 0.1;
            break;
          case ".":
            this.layerIndexInFocus += 0.1;
            break;
          case "=":
            this.s1 = gp5.constrain(this.s1 + 1, 1, 50);
            break;
          case "-":
            this.s1 = gp5.constrain(this.s1 - 1, 1, 50);
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
      }
    } else {
      // do something
    }
  }

  renderToBuffer(
    buffer: p5.Graphics,
    geometry: p5.Geometry,
    shader: p5.Shader,
  ) {
    buffer.shader(shader);
    shader.setUniform("modelViewMatrix", [...this.modelViewMatrix]);
    shader.setUniform("projectionMatrix", [...this.projectionMatrix]);
    shader.setUniform("mouse", [this.mouseX_object!, this.mouseY_object!]);
    shader.setUniform("layerId", this.index + 1);
    shader.setUniform("r1", this.r1);
    shader.setUniform("r2", this.r2);
    shader.setUniform("s1", this.s1);
    shader.setUniform("s2", this.s2);
    shader.setUniform("palette", this._palette);
    shader.setUniform("paletteSize", this._palette.width);
    shader.setUniform("selected", VGeoCluster.selectedFeatureId);
    buffer.model(geometry);
  }

  show(renderer: p5) {
    if (!this.visible) return;
    // super.show(renderer);
    // this.handleEvents();
    if (this.clusterGeometry && this.secondaryClusterGeometry) {
      if (this.pixelShader) {
        VGeoCluster.pixelTarget.texture(this._palette);
        this.renderToBuffer(
          VGeoCluster.pixelTarget,
          this.clusterGeometry,
          this.pixelShader,
        );
      }
      if (this.outlineShader) {
        // TODO: comments
        VGeoCluster.pixelTarget.fill(0);
        this.renderToBuffer(
          VGeoCluster.pixelTarget,
          this.secondaryClusterGeometry,
          this.outlineShader,
        );
      }
      if (this.idShader) {
        this.renderToBuffer(
          VGeoCluster.idTarget,
          this.clusterGeometry,
          this.idShader,
        );
      }
    }
  }
}
