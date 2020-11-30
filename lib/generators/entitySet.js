"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEntitySet = void 0;
var tslib_1 = require("tslib");
var fs_1 = require("fs");
var generate_1 = require("../generate");
var config_model_1 = require("../config.model");
var entityRepresentation_1 = require("../generators/entityRepresentation");
function generateEntitySet(edmx, entitySetName, entitySetConfig, outputDirectory, serviceUrl) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var entitySet, entityType, outputLines_1, outputFile, err_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    entitySet = edmx.entitySets[entitySetName];
                    if (!entitySet) {
                        generate_1.logger.error('No EntitySet ' + entitySetName);
                        return [2 /*return*/];
                    }
                    entityType = edmx.entityTypes[entitySet.$.EntityType];
                    if (!entityType) {
                        generate_1.logger.error("No EntityType " + entitySet.$.EntityType + " for EntitySet " + entitySetName);
                        return [2 /*return*/];
                    }
                    generate_1.logger.info('Generating EntitySet: ' + entitySetName);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    outputLines_1 = ["import { ODataService } from '@pta-kyma/c4c-odata-access';\r\n"];
                    if (!entitySetConfig.operations) {
                        entitySetConfig.operations = config_model_1.defaultOperations(entityType);
                    }
                    generate_1.logger.info('  operations: ' +
                        Object.entries(entitySetConfig.operations)
                            .map(function (_a) {
                            var _b = tslib_1.__read(_a, 2), name = _b[0], op = _b[1];
                            return name + " (" + op.type + ")";
                        })
                            .join(', '));
                    config_model_1.setupDefaultsWhereMissing(entitySetName, entityType, entitySetConfig.operations);
                    outputLines_1.push("export const " + entitySet.$.Name + " = {");
                    Object.entries(entitySetConfig.operations).forEach(function (_a) {
                        var _b = tslib_1.__read(_a, 2), operationName = _b[0], e = _b[1];
                        var expand = e.expand && e.expand.length > 0 ? '&$expand=' + e.expand.join(',') : '';
                        switch (e.type) {
                            case 'query':
                                outputLines_1.push("\n   " + operationName + "(service: ODataService, filter?: string): Promise<" + e.entityName + "[]> {\n    if (filter === undefined) {\n        filter = '$top=20';\n    }\n\n    const base = '" + serviceUrl + "/" + entitySetName + "';\n    const select = '" + (e.onlySelectedProperties ? '$select=' + e.properties.concat(e.expand || []).join(',') : '') + "';\n\n    const expand = '" + expand + "';\n    const query = base + '?' + select + expand + '&' + filter;\n   \n    return service.query<" + e.entityName + "[]>(query);\n  },\n");
                                break;
                            case 'fetch':
                                outputLines_1.push("\n   " + operationName + "(service: ODataService, objectID: string): Promise<" + e.entityName + "> {\n    const base = \"" + serviceUrl + "/" + entitySet.$.Name + "('\" + objectID + \"')\";\n    const select = '" + (e.onlySelectedProperties ? '$select=' + e.properties.concat(e.expand || []).join(',') : '') + "';\n    const expand = '" + expand + "';\n    const query = base + '?' + select + expand;\n\n    return service.query<" + e.entityName + ">(query);\n  },\n");
                                break;
                            case 'update':
                                outputLines_1.push("\n   " + operationName + "(service: ODataService, objectID: string, object: " + e.entityName + "): Promise<any> {   \n    const url = \"" + serviceUrl + "/" + entitySet.$.Name + "('\" + objectID + \"')\";    \n    return service.patch<" + e.entityName + ">(url, obj);\n  },\n");
                                break;
                            default:
                                throw new Error('Not supported operation ' + e.type);
                        }
                    });
                    outputLines_1.push('}\r\n');
                    Object.entries(entitySetConfig.operations).forEach(function (_a) {
                        var _b = tslib_1.__read(_a, 2), operationName = _b[0], operation = _b[1];
                        entityRepresentation_1.generateEntityRepresentation(outputLines_1, operation, operationName, entityType, edmx);
                    });
                    return [4 /*yield*/, fs_1.promises.open(outputDirectory + "/" + entitySetName + ".ts", 'w')];
                case 2:
                    outputFile = _a.sent();
                    return [4 /*yield*/, outputFile.writeFile(outputLines_1.join('\r\n'))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, outputFile.close()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    err_1 = _a.sent();
                    generate_1.logger.error("Failed to process  " + entitySetName + ": " + err_1.message);
                    return [3 /*break*/, 7];
                case 6: return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.generateEntitySet = generateEntitySet;
//# sourceMappingURL=entitySet.js.map