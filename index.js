'use strict';

const fs = require('fs');
const vm = require('vm');
const v8 = require('v8');
const path = require('path');
const Module = require('module');

v8.setFlagsFromString('--no-lazy');

if (Number.parseInt(process.versions.node.split('.')[0], 10) >= 12) {
  v8.setFlagsFromString('--no-flush-bytecode');
}

const COMPILED_EXTNAME = '.jsc';

/**
 * Generates v8 bytecode buffer.
 */
const compileCode = function (javascriptCode) {
  if (typeof javascriptCode !== 'string') {throw new Error(`javascriptCode must be string. ${typeof javascriptCode} was given.`);}
  let script = new vm.Script(javascriptCode, {produceCachedData: true});
  let bytecodeBuffer = (script.createCachedData && script.createCachedData.call) ? script.createCachedData():script.cachedData;
  return bytecodeBuffer;
};

const fixBytecode = function (bytecodeBuffer) {

  if (!Buffer.isBuffer(bytecodeBuffer)) {
    throw new Error(`bytecodeBuffer must be a buffer object.`);
  }

  let dummyBytecode = compileCode('"ಠ_ಠ"');

  if (process.version.startsWith('v8.8') || process.version.startsWith('v8.9')) {
    // Node is v8.8.x or v8.9.x
    dummyBytecode.slice(16, 20).copy(bytecodeBuffer, 16);
    dummyBytecode.slice(20, 24).copy(bytecodeBuffer, 20);
  } else if (process.version.startsWith('v12') || process.version.startsWith('v13')) {
    dummyBytecode.slice(12, 16).copy(bytecodeBuffer, 12);
  } else {
    dummyBytecode.slice(12, 16).copy(bytecodeBuffer, 12);
    dummyBytecode.slice(16, 20).copy(bytecodeBuffer, 16);
  }
};

const readSourceHash = function (bytecodeBuffer) {

  if (!Buffer.isBuffer(bytecodeBuffer)) {throw new Error(`bytecodeBuffer must be a buffer object.`);}
  if (process.version.startsWith('v8.8') || process.version.startsWith('v8.9')) {
    // Node is v8.8.x or v8.9.x
    return bytecodeBuffer.slice(12, 16).reduce((sum, number, power) => sum += number * Math.pow(256, power), 0);
  } else {
    return bytecodeBuffer.slice(8, 12).reduce((sum, number, power) => sum += number * Math.pow(256, power), 0);
  }
};

/**
 * Runs v8 bytecode buffer and returns the result.
 * @param   {Buffer} bytecodeBuffer The buffer object that was created using compileCode function.
 * @returns {any}    The result of the very last statement executed in the script.
 */
const runBytecode = function (bytecodeBuffer) {
  if (!Buffer.isBuffer(bytecodeBuffer)) {throw new Error(`bytecodeBuffer must be a buffer object.`);}
  fixBytecode(bytecodeBuffer);
  let length = readSourceHash(bytecodeBuffer);
  let dummyCode = "";
  if (length > 1) {dummyCode = '"' + "\u200b".repeat(length - 2) + '"';} // "\u200b" Zero width space
  let script = new vm.Script(dummyCode, {cachedData: bytecodeBuffer});
  if (script.cachedDataRejected) {throw new Error('Invalid or incompatible cached data (cachedDataRejected)');}
  return script.runInThisContext();
};



/**
 * Runs .jsc file and returns the result.
 * @param   {string} filename
 * @returns {any}    The result of the very last statement executed in the script.
 */
const runBytecodeFile = function (filename) {

  if (typeof filename !== 'string') {throw new Error(`filename must be a string. ${typeof filename} was given.`);}
  let bytecodeBuffer = fs.readFileSync(filename);
  return runBytecode(bytecodeBuffer);
};

Module._extensions[COMPILED_EXTNAME] = function (module, filename) {

  let bytecodeBuffer = fs.readFileSync(filename);

  fixBytecode(bytecodeBuffer);

  let length = readSourceHash(bytecodeBuffer);

  let dummyCode = "";

  if (length > 1) {
    dummyCode = '"' + "\u200b".repeat(length - 2) + '"'; // "\u200b" Zero width space
  }

  let script = new vm.Script(dummyCode, {filename: filename,lineOffset: 0,displayErrors: true,cachedData: bytecodeBuffer});
  if (script.cachedDataRejected) {throw new Error('Invalid or incompatible cached data (cachedDataRejected)');}
  function require(id) {return module.require(id);}
  require.resolve = function (request, options) {return Module._resolveFilename(request, module, false, options);};
  require.main = process.mainModule;
  require.extensions = Module._extensions;
  require.cache = Module._cache;
  let compiledWrapper = script.runInThisContext({
    filename: filename,
    lineOffset: 0,
    columnOffset: 0,
    displayErrors: true,
  });
  let dirname = path.dirname(filename);
  let args = [module.exports, require, module, filename, dirname, process, global];
  return compiledWrapper.apply(module.exports, args);
};

global.bytenode = {
    runBytecode, runBytecodeFile
};

module.exports = global.bytenode;
