/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ini = require("ini")
const fs = require('fs');
// load in fs and ini
//TODO : add this to Configfile.js AND (see below)
// att (at the minimum) a name attribute to that class. AND
// modify the sql to possibly add columns for point name and point units.
//for now, I'll store the name and units in 2 dictionaries.


const config = ini.parse(fs.readFileSync('./mb-072.ini', 'utf-8'));

//three variables to get:
var name = config.NAME;
var numberToUnits = {};
var numberToName = {};

//this approach assumes that there will be at most 99 points.
for (x in config){
    if (x.includes("UNIT")){
        numberToUnits[x.slice(0, 7)] = config[x];
    }
    if (x.includes("NAME") && x.includes("POINT")){
        numberToName[x.slice(0, 7)] = config[x];
    }
}

console.log(numberToUnits);
console.log(numberToName);