'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _app = require('../app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_app2.default.server = _http2.default.createServer(_app2.default);

var port = process.env.PORT || '3000';
_app2.default.set('port', port);

_app2.default.listen(port);

console.log("server running");

exports.default = _app2.default;

//# sourceMappingURL=server-compiled.js.map