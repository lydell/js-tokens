// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

// This regex comes from regex.coffee, and is inserted here by generate-index.js
// (run `npm run build`).
module.exports = /((['"])(?:(?!\2)[^\\\r\n]|\\(?:\r\n|[\s\S]))*(\2)?)|(\/\/.*)|(\/\*(?:[^*]|\*(?!\/))*(\*\/)?)|(\/(?!\*)(?:\[(?:[^\]\\\r\n]|\\.)*\]|[^\/\]\\\r\n]|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiy]{1,4}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))|(-?(?:0[xX][\da-fA-F]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?))|((?!\d)(?:[$\w\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]{1,6}\})+)|(--|\+\+|&&|\|\||=>|\.{3}|(?:[+\-*\/%&|^]|<{1,2}|>{1,3}|!=?|={1,2})=?|[?:~])|([;,.[\](){}])|(\s+)|(^$|[\s\S])/g

module.exports.matchToToken = function(match) {
  token = {type: "invalid", value: match[0]}
  if (match[ 1]) token.type = "string" , token.closed = !!match[3]
  if (match[ 4]) token.type = "comment"
  if (match[ 5]) token.type = "comment", token.closed = !!match[6]
  if (match[ 7]) token.type = "regex"
  if (match[ 8]) token.type = "number"
  if (match[ 9]) token.type = "name"
  if (match[10]) token.type = "operator"
  if (match[11]) token.type = "punctuation"
  if (match[12]) token.type = "whitespace"
  return token
}
