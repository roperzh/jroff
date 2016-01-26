/**
 * Jroff 0.0.1 <http://roperzh.github.io/jroff.js>
 * Copyright (c)2015 Roberto Dip <http://roperzh.com>
 * @license Distributed under MIT license
 * @module Jroff
 */

(function (root, factory) {
    if(typeof define === 'function' && define.amd) {
      define([], factory);
    } else if(typeof module === 'object' && module.exports) {
      module.exports = factory();
    } else {
      root.Jroff = factory();
    }
  }(this, function () { //eslint-disable-line max-statements
    "use strict";
