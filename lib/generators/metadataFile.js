"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMetadataFile = void 0;
var tslib_1 = require("tslib");
var fs_1 = require("fs");
function generateMetadataFile(edmx, outputDirectory) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var outputLines, _a, _b, entityType;
        var e_1, _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    outputLines = [];
                    outputLines.push('export const metadata = {');
                    try {
                        for (_a = tslib_1.__values(Object.values(edmx.entityTypes)), _b = _a.next(); !_b.done; _b = _a.next()) {
                            entityType = _b.value;
                            outputLines.push(entityType.$.Name + ': {');
                            outputLines.push('    Properties : {');
                            entityType.Property.forEach(function (p) {
                                outputLines.push(p.$.Name + ": '" + p.$.Name + "',");
                            });
                            outputLines.push('},'); // end of Properties
                            outputLines.push('    NavigationProperties : {');
                            if (entityType.NavigationProperty) {
                                entityType.NavigationProperty.forEach(function (p) {
                                    outputLines.push(p.$.Name + ": '" + p.$.Name + "',");
                                });
                            }
                            outputLines.push('}'); // end of NavigationProperties
                            outputLines.push('},'); // end of EntityType
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    outputLines.push('}');
                    return [4 /*yield*/, fs_1.promises.writeFile(outputDirectory + '/metadata.ts', outputLines.join('\r\n'))];
                case 1:
                    _d.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.generateMetadataFile = generateMetadataFile;
//# sourceMappingURL=metadataFile.js.map