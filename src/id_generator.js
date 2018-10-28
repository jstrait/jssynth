"use strict";

export class IDGenerator {
  constructor(initialNextID) {
    this.nextID = initialNextID;
  };

  next() {
    this.nextID += 1;
    return this.nextID;
  };
};
