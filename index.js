module.exports = /(\s+)|(\/\/.*|\/\*(?:[^*]|\*(?!\/))*(?:\*\/)?)|('(?:[^'\\\r\n]|\\(?:\r\n|[\s\S]))*'?|"(?:[^"\\\r\n]|\\(?:\r\n|[\s\S]))*"?)|(\/(?:\[(?:[^\]\\\r\n]|\\.)*\]|[^\/\]\\\r\n]|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiy]{1,4}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))|(-?(?:0[xX][\da-fA-F]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?))|((?:[$_a-zA-Z\d\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]{1,6}\})+)|([;,.[\](){}])|(=>)|(--|\+\+|&&|\|\||(?:[+\-*\/%&|^]|<{1,2}|>{1,3}|!=?|={1,2})=?|[?:~])|(^$)|([\s\S])/g
module.exports.names = [
  "whitespace",
  "comment",
  "string",
  "regex",
  "number",
  "name",
  "punctuation",
  "functionArrow",
  "operator",
  "empty",
  "invalid"
]