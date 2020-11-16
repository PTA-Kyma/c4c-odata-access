"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEntitySetConfig = void 0;
var tslib_1 = require("tslib");
var entityRepresentation_1 = require("../generators/entityRepresentation");
var fs_1 = require("fs");
var config_model_1 = require("../config.model");
function generateEntitySetConfig(context, entitySetName, outputDirectory) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var config, entitySet, entityType, outputLines_1, outputFile, err_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = context.config.EntitySets[entitySetName];
                    entitySet = context.entitySets[entitySetName];
                    if (!entitySet) {
                        return [2 /*return*/, console.error('No EntitySet ' + entitySetName)];
                    }
                    entityType = context.entityTypes[entitySet.$.EntityType];
                    if (!entityType) {
                        return [2 /*return*/, console.error("No EntityType " + entitySet.$.EntityType + " for EntitySet " + entitySetName)];
                    }
                    console.log('Generating EntitySet ' + entitySetName);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    outputLines_1 = ["import { ODataService } from 'c4c-odata-access';\r\n"];
                    if (!config.operations) {
                        config.operations = config_model_1.defaultOperations(entityType);
                    }
                    config_model_1.setupDefaultsWhereMissing(entitySetName, entityType, config.operations);
                    outputLines_1.push("export const " + entitySet.$.Name + " = {");
                    Object.entries(config.operations).forEach(function (_a) {
                        var _b = tslib_1.__read(_a, 2), operationName = _b[0], e = _b[1];
                        var expand = e.expand && e.expand.length > 0 ? '&$expand=' + e.expand.join(',') : '';
                        switch (e.type) {
                            case 'query':
                                outputLines_1.push(operationName + "(service: ODataService, filter?: string): Promise<" + e.entityName + "[]> {");
                                outputLines_1.push("if (filter === undefined) filter = '$top=20'");
                                outputLines_1.push("const base = '" + context.config.ODataService + "/" + entitySet.$.Name + "';");
                                outputLines_1.push("const select = '" + (e.onlySelectedProperties
                                    ? '$select=' + e.properties.concat(e.expand || []).join(',')
                                    : '') + "';");
                                outputLines_1.push("const expand = '" + expand + "';");
                                outputLines_1.push("const query = base + '?' + select + expand + filter");
                                outputLines_1.push("return service.query<" + e.entityName + "[]>(query);");
                                outputLines_1.push('},\r\n');
                                break;
                            case 'fetch':
                                outputLines_1.push(operationName + "(service: ODataService, objectID: string): Promise<" + e.entityName + "> {");
                                outputLines_1.push("const base = \"" + context.config.ODataService + "/" + entitySet.$.Name + "('\" + objectID + \"')\";");
                                outputLines_1.push("const select = '" + (e.onlySelectedProperties
                                    ? '$select=' + e.properties.concat(e.expand || []).join(',')
                                    : '') + "';");
                                outputLines_1.push("const expand = '" + expand + "';");
                                outputLines_1.push("const query = base + '?' + select + expand;");
                                outputLines_1.push("return service.query<" + e.entityName + ">(query);");
                                outputLines_1.push('},\r\n');
                                break;
                            default:
                                throw new Error('Not supported operation ' + e.type);
                        }
                    });
                    outputLines_1.push('}\r\n');
                    Object.entries(config.operations).forEach(function (_a) {
                        var _b = tslib_1.__read(_a, 2), operationName = _b[0], operation = _b[1];
                        entityRepresentation_1.generateEntityRepresentation(outputLines_1, operation, operationName, entityType, context);
                    });
                    return [4 /*yield*/, fs_1.promises.open(outputDirectory + "/" + context.config.ODataService + "." + entitySetName + ".ts", 'w')];
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
                    console.log(err_1);
                    return [3 /*break*/, 7];
                case 6: return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.generateEntitySetConfig = generateEntitySetConfig;
//# sourceMappingURL=entitySet.js.map