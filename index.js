// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

// This regex comes from regex.coffee, and is inserted here by generate-index.js
// (run `npm run build`).
module.exports = /(\s+)|(\/\/.*)|(\/\*(?:[^*]|\*(?!\/))*(\*\/)?)|((['"])(?:(?!\6)[^\\\r\n]|\\(?:\r\n|[\s\S]))*(\6)?)|(\/(?:\[(?:[^\]\\\r\n]|\\.)*\]|[^\/\]\\\r\n]|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiy]{1,4}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))|(-?(?:0[xX][\da-fA-F]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?))|((?:[$\w\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]{1,6}\})+)|(--|\+\+|&&|\|\||=>|\.{3}|(?:[+\-*\/%&|^]|<{1,2}|>{1,3}|!=?|={1,2})=?|[?:~])|([;,.[\](){}])|(^$|[\s\S])/g

module.exports.matchToToken = function(match) {
  token = {type: "invalid", value: match[0]}
  if (match[ 1]) token.type = "whitespace"
  if (match[ 2]) token.type = "comment"
  if (match[ 3]) token.type = "comment", token.closed = !!match[4]
  if (match[ 5]) token.type = "string" , token.closed = !!match[7]
  if (match[ 8]) token.type = "regex"
  if (match[ 9]) token.type = "number"
  if (match[10]) token.type = "name"
  if (match[11]) token.type = "operator"
  if (match[12]) token.type = "punctuation"
  return token
}
