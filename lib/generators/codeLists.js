"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodelists = void 0;
var tslib_1 = require("tslib");
var fs_1 = require("fs");
function generateCodelists(context) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var outputLines;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    outputLines = [];
                    outputLines.push('export const codelists = {');
                    Object.entries(context.codeLists).forEach(function (_a) {
                        var _b = tslib_1.__read(_a, 2), entityName = _b[0], properties = _b[1];
                        outputLines.push(" " + entityName + ": {");
                        Object.entries(properties).forEach(function (_a) {
                            var _b = tslib_1.__read(_a, 2), propertyName = _b[0], codelist = _b[1];
                            outputLines.push("  '" + propertyName + "': '" + context.baseUrl + "/" + codelist + "', ");
                        });
                        outputLines.push(" },");
                    });
                    outputLines.push('}');
                    return [4 /*yield*/, fs_1.promises.writeFile(context.targetFolderPath + '/codelists.ts', outputLines.join('\r\n'))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.generateCodelists = generateCodelists;
//# sourceMappingURL=codeLists.js.map