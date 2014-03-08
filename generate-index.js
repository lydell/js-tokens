// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var fs = require("fs")

require("coffee-script/register")
var regex = require("./regex.coffee")

var source = fs.readFileSync("regex.coffee").toString()
var names = []
source.replace(/^\s*\( # <([^>]+)>/mg, function(match, name) {
  names.push(name)
})

var code = [
  "module.exports = /" + regex.source.replace(/\//g, "\\/") + "/g",
  "module.exports.names = " + JSON.stringify(names, null, 2),
].join("\n")

fs.writeFileSync("index.js", code)
