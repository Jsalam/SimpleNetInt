"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layout = void 0;
var main_1 = require("../../main");
/**
 * Instances of this class are associated with VClusters
 */
var Layout = /** @class */ (function () {
    function Layout() {
        this.width = main_1.gp5.width;
        this.height = main_1.gp5.height;
        this.margin = { left: 0, top: 0, right: 0, bottom: 0 };
        // the layout area excluding margins
        this.area = this.setArea();
        this.vNodes;
    }
    Layout.prototype.subscribeVNodes = function (vNodes) {
        this.vNodes = vNodes;
    };
    Layout.prototype.setWidth = function (wdth) {
        this.width = wdth;
        this.area = this.setArea(wdth, this.height);
    };
    Layout.prototype.setHeight = function (hght) {
        this.height = hght;
        this.area = this.setArea(this.width, hght);
    };
    Layout.prototype.setArea = function (wdth, hght) {
        var w, h;
        if (!wdth) {
            w = this.width - this.margin.left - this.margin.right;
        }
        else {
            w = wdth;
        }
        if (!hght) {
            h = this.height - this.margin.top - this.margin.bottom;
        }
        else {
            h = hght;
        }
        return { width: w, height: h };
    };
    Layout.prototype.linearArray = function (stepX, stepY) {
        var xCapacity = this.area.width / stepX;
        var xPos = 0;
        var yPos = 0;
        for (var i = 0; i < this.vNodes.length; i++) {
            if (i > 0 && i % xCapacity == 0) {
                xPos = 0;
                yPos += stepY;
            }
            xPos += stepX;
            this.vNodes[i].setX(xPos);
            this.vNodes[i].setY(yPos);
        }
    };
    /**
     * Based on NetInt Concentric Layouts. https://github.com/LeonardoResearchGroup/NetInt/blob/master/Java/CommunityVisualizationJUNG/src/netInt/containers/layout/ConcentricLayout.java
     * @param {Number} maxRadius
     */
    Layout.prototype.concentricArray = function (maxRadius, gapFactor) {
        var accLength = 0;
        var maxCircumference = this._getCircumference(maxRadius);
        var largest = 0;
        var lastRadius = 0;
        // The collection of Nodes belonging to each tier
        var rings = [];
        // Temporary collection of nodes
        var tempVNodes = [];
        for (var _i = 0, _a = this.vNodes; _i < _a.length; _i++) {
            var vNode = _a[_i];
            var nodeDiam = gapFactor * vNode.diam;
            accLength += nodeDiam;
            // This is to get the largest node diameter
            if (nodeDiam > largest) {
                largest = nodeDiam;
            }
            if (accLength <= maxCircumference) {
                // Push nodes into the first ring
                tempVNodes.push(vNode);
            }
            else {
                // Set the locations for nodes in the collection and get the tier radius
                lastRadius = this.setLocations(maxCircumference, lastRadius, gapFactor);
                // Add the collected nodes satisfying the former condition
                rings.push(tempVNodes);
                // reset acclength to the diameter of the new firstnode
                accLength = nodeDiam;
                // Set the next tier radius
                lastRadius += largest;
                // Gets the next tier circumference
                maxCircumference = this._getCircumference(lastRadius);
                // Reset the collection of nodes
                tempVNodes = [];
                // This is to get the largest node diameter
                largest = nodeDiam;
                // add the current node to the new tier's collection
                tempVNodes.push(vNode);
            }
        }
        // Set the locations for nodes in the collection
        this.setLocations(maxCircumference, lastRadius, gapFactor);
        // Adds the very last tier's collection to rings
        rings.push(tempVNodes);
        // clean memory
        tempVNodes = [];
        // Return collection
        //  return rings;
    };
    Layout.prototype.setLocations = function (totalLength, lastRadius, gapFactor) {
        // Distribute all possible angles in all length units
        var angleFraction = (Math.PI * 2) / this.vNodes.length; //totalLength;
        // Calculate the tier's radius
        var radius = totalLength / (Math.PI * 2);
        // If the radius is too small
        if (radius < 200) {
            radius = 200;
        }
        // If the radius is smaller than the previous tier
        if (radius < lastRadius) {
            radius = lastRadius;
        }
        // Accumulated length
        var accLength = 0;
        for (var i = 0; i < this.vNodes.length; i++) {
            var nodeLength = gapFactor * this.vNodes[i].diam;
            var angle = i * angleFraction;
            accLength += nodeLength;
            // set the location for that vertex
            var posX = Math.cos(angle) * radius;
            var posY = Math.sin(angle) * radius;
            this.vNodes[i].setX(posX);
            this.vNodes[i].setY(posY);
        }
        return radius;
    };
    Layout.prototype._getCircumference = function (radius) {
        var result = 2 * Math.PI * radius;
        return result;
    };
    return Layout;
}());
exports.Layout = Layout;
