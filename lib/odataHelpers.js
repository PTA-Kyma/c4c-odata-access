"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = void 0;
var dateRegex = /Date\((\d+)\)/;
function parseDate(date) {
    var match = dateRegex.exec(date);
    if (!match)
        return null;
    return new Date(Number(match[1]));
}
exports.parseDate = parseDate;
//# sourceMappingURL=odataHelpers.js.map