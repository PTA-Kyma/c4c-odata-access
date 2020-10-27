"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyType = void 0;
var tslib_1 = require("tslib");
var fs_1 = require("fs");
var path_1 = require("path");
var xml2js_1 = require("xml2js");
var config_model_1 = require("./config.model");
var context = {
    entitySets: {},
    entityTypes: {},
    config: { ODataService: '', Namespace: '' },
    associations: {},
};
var _a = tslib_1.__read(process.argv, 4), _1 = _a[0], _2 = _a[1], sourceFilePath = _a[2], outputDirectory = _a[3];
if (!sourceFilePath || !outputDirectory) {
    throw new Error('Missing parameters, use generate {source file} {output folder}\r\nExample: generate path/file.edmx path/src/folder');
}
var projectPath = path_1.resolve('../..');
sourceFilePath = path_1.join(projectPath, sourceFilePath);
var configFilePath = sourceFilePath.replace('.edmx', '.json');
outputDirectory = path_1.join(projectPath, outputDirectory);
console.log(sourceFilePath, outputDirectory);
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, err_1, f, xml, schemas, tmp, err_2, _d, _e, _i, name_1;
        return tslib_1.__generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 2, , 3]);
                    _a = context;
                    _c = (_b = JSON).parse;
                    return [4 /*yield*/, fs_1.promises.readFile(configFilePath, 'utf-8')];
                case 1:
                    _a.config = _c.apply(_b, [_f.sent()]);
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _f.sent();
                    console.error('Failed to read from ' + configFilePath);
                    throw err_1;
                case 3:
                    if (!context.config.ODataService) {
                        context.config.ODataService = 'c4codataapi';
                    }
                    if (!context.config.Namespace) {
                        context.config.Namespace = 'c4codata';
                    }
                    return [4 /*yield*/, fs_1.promises.readFile(sourceFilePath, { encoding: 'utf-8' })];
                case 4:
                    f = _f.sent();
                    return [4 /*yield*/, xml2js_1.parseStringPromise(f)];
                case 5:
                    xml = _f.sent();
                    schemas = xml['edmx:Edmx']['edmx:DataServices'][0].Schema;
                    schemas.forEach(function (schema) {
                        schema.EntityType.forEach(function (entityType) {
                            context.entityTypes[context.config.Namespace + '.' + entityType.$.Name] = entityType;
                        });
                        schema.EntityContainer.forEach(function (container) {
                            container.EntitySet.forEach(function (entitySet) {
                                context.entitySets[entitySet.$.Name] = entitySet;
                            });
                        });
                        schema.Association.forEach(function (association) {
                            context.associations[context.config.Namespace + '.' + association.$.Name] = association;
                        });
                    });
                    tmp = path_1.join(projectPath, 'tmp');
                    _f.label = 6;
                case 6:
                    _f.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, fs_1.promises.mkdir(tmp)];
                case 7:
                    _f.sent();
                    return [3 /*break*/, 9];
                case 8:
                    err_2 = _f.sent();
                    return [3 /*break*/, 9];
                case 9: return [4 /*yield*/, fs_1.promises.writeFile(tmp + '/entityTypes.json', JSON.stringify(context.entityTypes, null, '\t'))];
                case 10:
                    _f.sent();
                    return [4 /*yield*/, fs_1.promises.writeFile(tmp + '/entityCollections.json', JSON.stringify(context.entitySets, null, '\t'))];
                case 11:
                    _f.sent();
                    if (!context.config.EntitySets)
                        return [2 /*return*/];
                    _d = [];
                    for (_e in context.config.EntitySets)
                        _d.push(_e);
                    _i = 0;
                    _f.label = 12;
                case 12:
                    if (!(_i < _d.length)) return [3 /*break*/, 15];
                    name_1 = _d[_i];
                    return [4 /*yield*/, generateEntitySetConfig(context, name_1)];
                case 13:
                    _f.sent();
                    _f.label = 14;
                case 14:
                    _i++;
                    return [3 /*break*/, 12];
                case 15: return [4 /*yield*/, generateMetadataFile(context)];
                case 16:
                    _f.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function generateEntitySetConfig(context, entitySetName) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var config, entitySet, entityType, outputLines_1, outputFile, err_3;
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
                        var expand = e.expand && e.expand.length > 0 ? '$expand=' + e.expand.join(',') : '';
                        switch (e.type) {
                            case 'query':
                                outputLines_1.push(operationName + "(service: ODataService, filter?: string): Promise<" + e.entityName + "[]> {");
                                outputLines_1.push("if (filter === undefined) filter = '$top=20'");
                                outputLines_1.push("return service.query<" + e.entityName + "[]>('" + context.config.ODataService + "/" + entitySet.$.Name + "?$select=" + e.properties.join(',') + expand + "&' + filter);");
                                outputLines_1.push('},\r\n');
                                break;
                            case 'fetch':
                                outputLines_1.push(operationName + "(service: ODataService, objectID: string): Promise<" + e.entityName + "> {");
                                outputLines_1.push("const filter = \"" + context.config.ODataService + "/" + entitySet.$.Name + "('\" + objectID + \"')?" + expand + "\"");
                                outputLines_1.push("return service.query<" + e.entityName + ">(filter);");
                                outputLines_1.push('},\r\n');
                                break;
                            default:
                                throw new Error('Not supported operation ' + e.type);
                        }
                    });
                    outputLines_1.push('}\r\n');
                    Object.entries(config.operations).forEach(function (_a) {
                        var _b = tslib_1.__read(_a, 2), operationName = _b[0], operation = _b[1];
                        generateEntityRepresentation(outputLines_1, operation, operationName, entityType, context);
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
                    err_3 = _a.sent();
                    console.log(err_3);
                    return [3 /*break*/, 7];
                case 6: return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function generateMetadataFile(context) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var outputLines, _a, _b, entityType;
        var e_1, _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    outputLines = [];
                    outputLines.push('export const metadata = {');
                    try {
                        for (_a = tslib_1.__values(Object.values(context.entityTypes)), _b = _a.next(); !_b.done; _b = _a.next()) {
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
                    return [4 /*yield*/, fs_1.promises.writeFile(outputDirectory + '/' + context.config.ODataService + '.metadata.ts', outputLines.join('\r\n'))];
                case 1:
                    _d.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getPropertyType(xmlType) {
    switch (xmlType) {
        case 'Edm.Int32':
        case 'Edm.Int16':
            return 'number';
        case 'Edm.String':
        default:
            return 'string';
    }
}
exports.getPropertyType = getPropertyType;
function generateEntityRepresentation(outputLines, operation, operationName, entityType, context) {
    var expandedProperties = [];
    if (operation.expand) {
        operation.expand.forEach(function (navigationPropertyName) {
            var navigationProperty = entityType.NavigationProperty.find(function (p) { return p.$.Name === navigationPropertyName; });
            if (!navigationProperty) {
                throw new Error("NavigationProperty " + navigationPropertyName + " on entity type " + entityType.$.Name + " not found!");
            }
            var childEntityTypeName = context.config.Namespace + '.' + navigationProperty.$.ToRole;
            var childEntityType = context.entityTypes[childEntityTypeName];
            if (!childEntityType) {
                throw new Error("Target EntityType " + childEntityTypeName + " not found for NavigationProperty " + navigationPropertyName + " on entity type " + entityType.$.Name);
            }
            var childEntityName = entityType.$.Name + "_" + operationName + "_" + navigationProperty.$.ToRole;
            outputLines.push("export interface " + childEntityName + " {");
            childEntityType.Property.forEach(function (property) {
                var name = property.$.Name;
                var nullable = property.$.Nullable === 'true';
                var type = getPropertyType(property.$.Type);
                outputLines.push("" + name + (nullable ? '?' : '') + ": " + type);
            });
            outputLines.push('}');
            var association = context.associations[navigationProperty.$.Relationship];
            if (!association) {
                throw new Error("No association " + navigationProperty.$.Relationship);
            }
            var associationEnd = association.End.find(function (e) { return e.$.Type === childEntityTypeName; });
            if (!associationEnd) {
                throw new Error("No association end with role " + childEntityTypeName);
            }
            expandedProperties.push({
                name: navigationPropertyName,
                type: childEntityName,
                singleOrArray: associationEnd.$.Multiplicity === '1' ? 'single' : 'array',
            });
        });
        console.log(entityType.NavigationProperty);
    }
    outputLines.push("export interface " + operation.entityName + " {");
    operation.properties.forEach(function (p) {
        var property = entityType.Property.find(function (p1) { return p1.$.Name === p; });
        if (!property) {
            throw new Error("Unknown property " + p);
        }
        var name = property.$.Name;
        var nullable = property.$.Nullable === 'true';
        var type = getPropertyType(property.$.Type);
        outputLines.push("" + name + (nullable ? '?' : '') + ": " + type);
    });
    expandedProperties.forEach(function (_a) {
        var name = _a.name, type = _a.type, singleOrArray = _a.singleOrArray;
        outputLines.push(name + ": " + type + (singleOrArray === 'single' ? '' : '[]') + ";");
    });
    outputLines.push("}\r\n");
}
main();
//# sourceMappingURL=generate.js.map