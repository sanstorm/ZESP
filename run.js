#!/usr/bin/env node
const v8 = require('v8');
const fs = require('fs');
const wrap = require('module').wrap;
const spawnSync = require('child_process').spawnSync;
const path = require("path");





//const bytenode = require('./index.js');
let args = process.argv.slice(2);
const program = {dirname: __dirname,filename: __filename,nodeBin: process.argv[0],flags: args.filter(arg => arg[0] === '-'),files: args.filter(arg => arg[0] !== '-' && arg[1] !== '-'),};
try {spawnSync(program.nodeBin, ['-r',path.resolve(__dirname, 'index.js')].concat(args),{stdio: 'inherit'});} catch (error) {console.error(error);}
