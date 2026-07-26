import { Vector } from "p5";

export interface Identifier {
  cluster: unknown;
  index: unknown;
  pajekIndex: unknown;
}

export interface CustomEvent {
  event: Event;
  type: string;
  pos: Vector;
}

export interface Observable {
  subscribe(obj: Observer): void;
}

export interface Observer {
  fromCanvas?(data: unknown): void;

  getDataFromContextualGUI?(data: unknown): unknown;
}

/**
 * @interface DimensionCategory
 * @description This interface represents a category of dimensions, which can contain child dimensions or subcategories.
 * It includes a name for the category and an array of children, which can be either DimensionCategory or DimensionID.
 */
export interface DimensionCategory {
  name: string;
  children: any[];
}

/**
 * @interface DimensionID
 * @description This interface represents a specific dimension identified by a name and a key. The comment is added to 
 * specify what the dimension is about. 
 */
export interface DimensionID {
  name: string;
  key: string;
  comment: string;
}

/**
 * @deprecated
 * @typedef {DimensionCategory | DimensionID} Dimensions
 * @description This type can be either a DimensionCategory or a DimensionID, allowing for a hierarchical structure of dimensions.
 */
//export type Dimensions = DimensionCategory | DimensionID;
