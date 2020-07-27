"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readRequirementsByType = exports.readRulesByParagraph = exports.readRulesBySection = void 0;

var _database = _interopRequireDefault(require("./database"));

var readRulesBySection = function readRulesBySection(sectionTitle) {
  var query = "\n        MATCH (s:Section {title: $sectionTitle}), (p:Paragraph), (r:Rule)\n        WHERE (s)-[:CONTAINS]->(p) AND (p)-[:CONTAINS]->(r) \n        RETURN r\n        ORDER BY r.index";
  return _database["default"].readTransaction(function (tx) {
    return tx.run(query, {
      sectionTitle: sectionTitle
    });
  });
};

exports.readRulesBySection = readRulesBySection;

var readRulesByParagraph = function readRulesByParagraph(paragraphIndex, limit) {
  var query = "\n        MATCH (p:Paragraph {index: $paragraphIndex}), (r:Rule)\n        WHERE (p)-[:CONTAINS]->(r) \n        RETURN r\n        ORDER BY r.index LIMIT $limit";
  return _database["default"].readTransaction(function (tx) {
    return tx.run(query, {
      paragraphIndex: paragraphIndex,
      limit: limit
    });
  });
};

exports.readRulesByParagraph = readRulesByParagraph;

var readRequirementsByType = function readRequirementsByType(paragraphIndex) {
  var query = "\n        MATCH (p:Paragraph {index: $paragraphIndex}), (r:Rule {desc: 'Requirements:'}), (s:SubRule)\n        WHERE (p)-[:CONTAINS]->(r) AND (r)-[:CONTAINS]->(s)\n        RETURN r, s\n        ORDER BY r, s.index";
  return _database["default"].readTransaction(function (tx) {
    return tx.run(query, {
      paragraphIndex: paragraphIndex
    });
  });
};

exports.readRequirementsByType = readRequirementsByType;
//# sourceMappingURL=queries.js.map