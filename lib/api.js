'use strict';

const async = require('async');

const read = require('./read-async');

const cssAstDiff = require('./css-ast-diff');

module.exports = (function() {
  var api = {};

  api.compareFiles = function(diff, src, callback, options) {
    var readDiff = read(diff);
    var readSrc = read(src);

    this._compare(readSrc, readDiff, callback, options);
  };

  api._compare = function(readDiff, readSrc, callback, options) {
    async.parallel(
      [readDiff, readSrc],
      function(err, results) {
        if (err) {
          callback(err);
        }
        results.push(callback, options);
        cssAstDiff.apply(null, results);
      }
    );
  };

  return api;
})();
