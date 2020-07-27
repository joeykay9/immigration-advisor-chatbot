"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _dotenv = _interopRequireDefault(require("dotenv"));

var _neo4jDriver = _interopRequireDefault(require("neo4j-driver"));

_dotenv["default"].config();

var driver = _neo4jDriver["default"].driver(process.env.AURA_ENDPOINT, _neo4jDriver["default"].auth.basic(process.env.AURA_USERNAME, process.env.AURA_PASSWORD), {
  encrypted: true
});

var session = driver.session();
var _default = session;
exports["default"] = _default;
//# sourceMappingURL=database.js.map