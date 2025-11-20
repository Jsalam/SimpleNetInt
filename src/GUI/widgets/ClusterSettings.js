"use strict";
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
exports.ClusterSettings = void 0;
var canvas_1 = require("../../canvas/canvas");
var vGeoCluster_1 = require("../../visualElements/vGeoCluster");
var DOMUtils_1 = require("../ContextualGUIs/DOMUtils");
var ClusterSettings = /** @class */ (function () {
    function ClusterSettings(vCluster) {
        this.vCluster = vCluster;
        this.dimemsionViewModels = [];
        this.dimensionControls = [];
        this.levels = this.getDepth(vCluster.cluster.dimensions) - 1;
        this.dimemsionViewModels = this.makeDimensionControlViewModels();
        this.dimensionControls = this.makeDimensionControls();
        this.timeControl = this.makeTimeControl();
        this.root = this.makeContainer(this.makeTitle(vCluster.cluster.label), this.makeControl.apply(this, __spreadArray(["Dimension"], this.dimensionControls, false)), this.makeControl("Time", this.timeControl), this.makeControl("Zoom Direction", this.makeZoomDirectionControl()), this.makeControl("Color Transform", this.makeColorTransformControl()));
        for (var i = 0; i < this.levels; ++i) {
            this.syncDimensionControl(i);
        }
        this.updateDimension();
        this.updateTimestamp();
    }
    Object.defineProperty(ClusterSettings, "container", {
        get: function () {
            if (!this._container) {
                this._container = (0, DOMUtils_1.createElement)("div", {
                    position: "absolute",
                    left: "0",
                    top: "10px",
                    bottom: "0",
                    width: "300px",
                    overflowY: "scroll",
                });
                this._container.onwheel = function (e) {
                    e.stopPropagation();
                };
                this._container.onmousedown = function (e) {
                    e.stopPropagation();
                };
                document.querySelector("#model").append(this._container);
            }
            return this._container;
        },
        enumerable: false,
        configurable: true
    });
    ClusterSettings.add = function (vCluster) {
        var settings = new ClusterSettings(vCluster);
        ClusterSettings.container.append(settings.root);
        this.all.push(settings);
    };
    ClusterSettings.reset = function () {
        this.container.innerHTML = "";
        this.all.length = 0;
    };
    ClusterSettings.prototype.getDepth = function (dimension) {
        var _this = this;
        if ("key" in dimension)
            return 1;
        return (Math.max.apply(Math, __spreadArray([0], dimension.children.map(function (dim) { return _this.getDepth(dim); }), false)) + 1);
    };
    ClusterSettings.prototype.makeContainer = function () {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        return DOMUtils_1.createElement.apply(void 0, __spreadArray(["div",
            {
                color: "white",
                padding: "10px",
            },
            null], children, false));
    };
    ClusterSettings.prototype.makeTitle = function (title) {
        var _this = this;
        return (0, DOMUtils_1.createElement)("div", null, null, (0, DOMUtils_1.createInputElement)(null, {
            type: "checkbox",
            checked: true,
            onclick: function (e) {
                _this.vCluster.visible = e.target.checked;
                // TODO: refactor this logic
                vGeoCluster_1.VGeoCluster.visible = vGeoCluster_1.VGeoCluster.all.filter(function (cluster) { return cluster.visible; });
            },
        }), (0, DOMUtils_1.createElement)("label", {
            marginLeft: "10px",
        }, null, title));
    };
    ClusterSettings.prototype.makeInputLabel = function (text) {
        return (0, DOMUtils_1.createElement)("div", {
            color: "gray",
        }, null, text);
    };
    ClusterSettings.prototype.makeControl = function (label) {
        var controls = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            controls[_i - 1] = arguments[_i];
        }
        return DOMUtils_1.createElement.apply(void 0, __spreadArray(["div",
            {
                margin: "10px",
            },
            null,
            this.makeInputLabel(label)], controls, false));
    };
    ClusterSettings.prototype.makeSelectElement = function (options, properties) {
        return (0, DOMUtils_1.createSelectElement)(options, {
            display: "block",
            width: "100%",
            background: "transparent",
            color: "white",
            fontSize: "14px",
        }, properties);
    };
    ClusterSettings.prototype.makeTimeControl = function () {
        var _this = this;
        return this.makeSelectElement(this.vCluster.cluster.timestamps.map(function (t) { return ({
            name: t,
            value: t,
        }); }), {
            onchange: function (e) {
                _this.updateTimestamp();
                e.target.blur();
            },
        });
    };
    ClusterSettings.prototype.makeDimensionControlViewModels = function () {
        var viewModels = [];
        var cur = this.vCluster.cluster.dimensions;
        while (cur && "children" in cur) {
            viewModels.push(cur);
            cur = cur.children[0];
        }
        return viewModels;
    };
    ClusterSettings.prototype.makeDimensionControls = function () {
        var _this = this;
        var controls = [];
        var _loop_1 = function (i) {
            controls.push(this_1.makeSelectElement([], {
                onchange: function (e) {
                    _this.onDimensionSelect(i);
                    e.target.blur();
                },
            }));
        };
        var this_1 = this;
        for (var i = 0; i < this.levels; ++i) {
            _loop_1(i);
        }
        return controls;
    };
    ClusterSettings.prototype.syncDimensionControl = function (i) {
        (0, DOMUtils_1.updateSelectOptions)(this.dimensionControls[i], this.dimemsionViewModels[i].children.map(function (dim) { return ({
            name: dim.name,
            value: "key" in dim ? dim.key : dim.name,
        }); }));
    };
    ClusterSettings.prototype.makeZoomDirectionControl = function () {
        var _this = this;
        return (0, DOMUtils_1.createSelectElement)([
            {
                name: "In",
                value: "1",
            },
            {
                name: "Out",
                value: "-1",
            },
        ], {
            display: "block",
            width: "100%",
            background: "transparent",
            color: "white",
            fontSize: "14px",
        }, {
            onchange: function (e) {
                if (_this.vCluster instanceof vGeoCluster_1.VGeoCluster) {
                    _this.vCluster.zoomDirection = Number(e.target.value);
                }
            },
        });
    };
    ClusterSettings.prototype.makeColorTransformControl = function () {
        var _this = this;
        return (0, DOMUtils_1.createSelectElement)([
            {
                name: "linear",
                value: "linear",
            },
            {
                name: "log",
                value: "log",
            },
            {
                name: "sqrt",
                value: "sqrt",
            },
        ], {
            display: "block",
            width: "100%",
            background: "transparent",
            color: "white",
            fontSize: "14px",
        }, {
            onchange: function (e) {
                if (_this.vCluster instanceof vGeoCluster_1.VGeoCluster) {
                    // TODO: refactor this
                    var value = e.target
                        .value;
                    switch (value) {
                        case "log":
                            _this.vCluster.scalarTransform =
                                vGeoCluster_1.VGeoCluster.scalarTransforms.log;
                            break;
                        case "sqrt":
                            _this.vCluster.scalarTransform =
                                vGeoCluster_1.VGeoCluster.scalarTransforms.sqrt;
                            break;
                        default:
                            _this.vCluster.scalarTransform =
                                vGeoCluster_1.VGeoCluster.scalarTransforms.linear;
                            break;
                    }
                }
                _this.vCluster.updatePalette();
                canvas_1.Canvas.update();
            },
        });
    };
    ClusterSettings.prototype.onDimensionSelect = function (index) {
        var _this = this;
        if (index < this.levels - 1) {
            this.dimemsionViewModels[index + 1] = this.dimemsionViewModels[index].children.find(function (dim) { return dim.name === _this.dimensionControls[index].value; });
            for (var i = index + 2; i < this.levels; ++i) {
                this.dimemsionViewModels[i] = this.dimemsionViewModels[i - 1]
                    .children[0];
            }
            for (var i = index + 1; i < this.levels; ++i) {
                this.syncDimensionControl(i);
            }
        }
        this.updateDimension();
    };
    ClusterSettings.prototype.updateDimension = function () {
        if (this.levels == 0)
            return;
        this.vCluster.dimension = this.dimensionControls[this.levels - 1].value;
        this.vCluster.updatePalette();
        canvas_1.Canvas.update();
    };
    ClusterSettings.prototype.updateTimestamp = function () {
        this.vCluster.timestamp = this.timeControl.value;
        this.vCluster.updatePalette();
        canvas_1.Canvas.update();
    };
    ClusterSettings.all = [];
    return ClusterSettings;
}());
exports.ClusterSettings = ClusterSettings;
