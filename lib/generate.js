"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.context = void 0;
var tslib_1 = require("tslib");
var entitySet_1 = require("./generators/entitySet");
var metadataFile_1 = require("./generators/metadataFile");
var fs_1 = require("fs");
var path_1 = require("path");
var xml2js_1 = require("xml2js");
var _a = tslib_1.__read(process.argv, 4), _1 = _a[0], _2 = _a[1], sourceFilePath = _a[2], outputDirectory = _a[3];
if (!sourceFilePath || !outputDirectory) {
    throw new Error('Missing parameters, use generate {source file} {output folder}\r\nExample: generate path/file.edmx path/src/folder');
}
var projectPath = path_1.resolve('../../..');
sourceFilePath = path_1.join(projectPath, sourceFilePath);
var configFilePath = sourceFilePath.replace('.edmx', '.json');
outputDirectory = path_1.join(projectPath, outputDirectory);
console.log(sourceFilePath, outputDirectory);
exports.context = {
    entitySets: {},
    entityTypes: {},
    config: { ODataService: '', Namespace: '' },
    associations: {},
};
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, err_1, f, xml, schemas, tmp, err_2, _d, _e, _i, name_1;
        return tslib_1.__generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 2, , 3]);
                    _a = exports.context;
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
                    if (!exports.context.config.ODataService) {
                        exports.context.config.ODataService = 'c4codataapi';
                    }
                    if (!exports.context.config.Namespace) {
                        exports.context.config.Namespace = 'c4codata';
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
                            exports.context.entityTypes[exports.context.config.Namespace + '.' + entityType.$.Name] = entityType;
                        });
                        schema.EntityContainer.forEach(function (container) {
                            container.EntitySet.forEach(function (entitySet) {
                                exports.context.entitySets[entitySet.$.Name] = entitySet;
                            });
                        });
                        schema.Association.forEach(function (association) {
                            exports.context.associations[exports.context.config.Namespace + '.' + association.$.Name] = association;
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
                case 9: return [4 /*yield*/, fs_1.promises.writeFile(tmp + '/entityTypes.json', JSON.stringify(exports.context.entityTypes, null, '\t'))];
                case 10:
                    _f.sent();
                    return [4 /*yield*/, fs_1.promises.writeFile(tmp + '/entityCollections.json', JSON.stringify(exports.context.entitySets, null, '\t'))];
                case 11:
                    _f.sent();
                    if (!exports.context.config.EntitySets)
                        return [2 /*return*/];
                    _d = [];
                    for (_e in exports.context.config.EntitySets)
                        _d.push(_e);
                    _i = 0;
                    _f.label = 12;
                case 12:
                    if (!(_i < _d.length)) return [3 /*break*/, 15];
                    name_1 = _d[_i];
                    return [4 /*yield*/, entitySet_1.generateEntitySetConfig(exports.context, name_1, outputDirectory)];
                case 13:
                    _f.sent();
                    _f.label = 14;
                case 14:
                    _i++;
                    return [3 /*break*/, 12];
                case 15: return [4 /*yield*/, metadataFile_1.generateMetadataFile(exports.context, outputDirectory)];
                case 16:
                    _f.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=generate.js.map