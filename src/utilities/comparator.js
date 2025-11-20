"use strict";
/**
 * @file comparators.ts
 * @description Contains comparison functions for sorting items in a list widget.
 * These functions can compare items based on their value, word length, or alphabetically.
 * These are designed to be used in sorting algorithms in the widgets of the GUI.
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comparator = void 0;
var Comparator = /** @class */ (function () {
    function Comparator() {
    }
    /**
     * @description Compares two items based on their value, word length, or alphabetically.
     * @param item - The first item to compare.
     * @param other - The second item to compare.
     * @returns {number} - Returns -1 if the first item is less than the second item, 1 if it is greater, and 0 if they are equal.
     */
    Comparator.compareValue = function (item, other) {
        if (item - other > 0) {
            return 1;
        }
        else if (item - other < 0) {
            return -1; // Return -1 if the first item is less than the second item
        }
        return 0; // Return 1 if the first item is greater than the second item
    };
    /**
     * @description Compares two items based on their word length.
     * @param item - The first item to compare (a string).
     * @param other - The second item to compare (a string).
     * @returns {number} - Returns -1 if the first item is shorter than the second item, 1 if it is longer, and 0 if they are of equal length.
     */
    Comparator.compareLength = function (item, other) {
        if (item.length < other.length) {
            return -1; // Return true if this word is shorter than the other word
        }
        else if (item.length > other.length) {
            return 1; // Return true if this word is longer than the other word
        }
        return 0; // Return true if this word is longer than the other word 
    };
    /**
     * @description Compares two items alphabetically.
     * @param item - The first item to compare (a string).
     * @param other - The second item to compare (a string).
     * @returns {number} - Returns -1 if the first item comes before the second item alphabetically, 1 if it comes after, and 0 if they are equal.
     */
    Comparator.compareAlphabetically = function (word, other) {
        if (word.localeCompare(other) < 0) {
            return -1; // Return true if this word comes before the other word alphabetically
        }
        else if (word.localeCompare(other) > 0) {
            return 1; // Return true if this word comes after the other word alphabetically
        }
        return 0; // Return 0 if both words are equal
    };
    Comparator.staticMethodNames = Object.getOwnPropertyNames(Comparator).filter(function (name) { return typeof Comparator[name] === "function" && name !== "length" && name !== "prototype" && name !== "name"; });
    return Comparator;
}());
exports.Comparator = Comparator;
