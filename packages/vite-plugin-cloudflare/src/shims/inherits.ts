function inherits(ctor: any, superCtor: any) {
  // implementation from standard node.js 'util' module
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype || null, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
}

module.exports = inherits
