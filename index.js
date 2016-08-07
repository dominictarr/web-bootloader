'use strict'

var appname = 'SWB'
var store = require('./store')(appname)
var log = require('./log')(appname)
var wb = window.WebBoot = require('./bootloader')(appname, store, log)

//minimal user interface...
require('./ui')(appname, wb)

