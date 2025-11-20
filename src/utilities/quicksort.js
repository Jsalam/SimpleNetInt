"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickSort = quickSort;
var comparator_1 = require("./comparator");
/** *********** QUICK SORT ALGORITHM *********** */
// Partition function
/**
 *
 * @param {*} arr the array to be sorted
 * @param {*} low the starting index of the array
 * @param {*} high the ending index of the array
 * @param {*} functionName the name of the internal function to use for comparison. See Comparator class for available functions.
 * This function partitions the array into two halves based on the pivot element.
 * Elements less than the pivot are moved to the left, and elements greater than or equal to the pivot are moved to the right.
 * The pivot is then placed in its correct position, and the function returns the index of the pivot.
 * @returns
 */
function partition(arr, low, high, functionName, attrName) {
    // Choose the pivot
    var pivot = arr[high];
    // Index of smaller element and indicates
    // the right position of pivot found so far
    var i = low - 1;
    // Traverse arr[low..high] and move all smaller
    // elements to the left side. Elements from low to
    // i are smaller after every iteration
    for (var j = low; j <= high - 1; j++) {
        if (comparator_1.Comparator[functionName](arr[j][attrName], pivot[attrName]) < 0) { // Dynamically invoke the specified internal function
            i++;
            swap(arr, i, j);
        }
    }
    // Move pivot after smaller elements and
    // return its position
    swap(arr, i + 1, high);
    return i + 1;
}
// Swap function
function swap(arr, i, j) {
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}
// The QuickSort function implementation
function quickSort(arr, low, high, functionName, attrName) {
    if (low < high) {
        // pi is the partition return index of pivot
        var pi = partition(arr, low, high, functionName, attrName);
        // Recursion calls for smaller elements
        // and greater or equals elements
        quickSort(arr, low, pi - 1, functionName, attrName);
        quickSort(arr, pi + 1, high, functionName, attrName);
    }
}
