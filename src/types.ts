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
