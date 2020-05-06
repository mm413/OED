/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 const ini = require("ini")
 const fs = require('fs');
 // load in fs and ini
 //TODO : add this to Configfile.js AND (see below)
 // add 'parsed contents' attribute to that class, AND
 // a name attribute. It will be the first part of each 
 // string in the list this function returns
 
 const config = ini.parse(fs.readFileSync('./mb-072.ini', 'utf-8'));
 
 var meters = [];
 // In array, each point is stored as: name.metername.units
 for (x in config){
     if (x.includes("POINT") && x.includes("NAME")){
         meters.push(config.NAME + "." + config[x] + "." + config[x.slice(0, 7) + "UNITS"]);
     }
 }
 
 console.log(meters);