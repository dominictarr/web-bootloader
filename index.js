'use strict'

var appname = 'SWB'
var store = require('./store')(appname, localStorage)
var log = require('./log')(appname, localStorage)
var wb = window.WebBoot = require('./bootloader')(appname, store, log)

//minimal user interface...
require('./ui')(appname, wb)

