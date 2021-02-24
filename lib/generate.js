"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var tslib_1 = require("tslib");
var fs_1 = require("fs");
var path_1 = require("path");
var winston_1 = tslib_1.__importStar(require("winston"));
var xml2js_1 = require("xml2js");
var codeLists_1 = require("./generators/codeLists");
var entitySet_1 = require("./generators/entitySet");
var metadataFile_1 = require("./generators/metadataFile");
var parseEdmxFile_1 = require("./parseEdmxFile");
var combine = winston_1.format.combine, timestamp = winston_1.format.timestamp, label = winston_1.format.label, prettyPrint = winston_1.format.prettyPrint, colorize = winston_1.format.colorize;
var _a = tslib_1.__read(process.argv, 4), _1 = _a[0], _2 = _a[1], configFilePath = _a[2], outputDirectory = _a[3];
if (!configFilePath || !outputDirectory) {
    throw new Error('Missing parameters, use generate {config file} {output folder}\r\nExample: generate path/file.edmx path/src/folder');
}
configFilePath = path_1.resolve(configFilePath);
outputDirectory = path_1.resolve(outputDirectory);
var configFilePathBase = path_1.dirname(configFilePath);
exports.logger = winston_1.createLogger({
    level: 'debug',
    transports: [
        new winston_1.default.transports.Console({
            format: combine(colorize(), timestamp(), winston_1.format.printf(function (i) { return i.level + " " + i.message; })),
        }),
    ],
});
function readConfig() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _a, _b, err_1;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    exports.logger.info('Reading config from ' + configFilePath + '...');
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, fs_1.promises.readFile(configFilePath, 'utf-8')];
                case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                case 2:
                    err_1 = _c.sent();
                    exports.logger.error('Failed to read from ' + configFilePath + ': ' + err_1.message);
                    throw err_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function readEdmxFile(name) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var edmxFilePath, f, xml, err_2;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    edmxFilePath = path_1.join(configFilePathBase, name + '.edmx');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    exports.logger.info("Reading service " + name + " definition from " + edmxFilePath);
                    return [4 /*yield*/, fs_1.promises.readFile(edmxFilePath, { encoding: 'utf-8' })];
                case 2:
                    f = _a.sent();
                    return [4 /*yield*/, xml2js_1.parseStringPromise(f)];
                case 3:
                    xml = (_a.sent());
                    return [2 /*return*/, parseEdmxFile_1.parseEdmxFile(xml)];
                case 4:
                    err_2 = _a.sent();
                    exports.logger.error("Failed to read " + edmxFilePath + ": " + err_2.message + " " + err_2.stack);
                    throw err_2;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var config, services, err_3, services_1, services_1_1, _a, serviceName, serviceConfig, targetFolderPath, err_4, edmxFile, err_5, e_1_1;
        var e_1, _b;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    exports.logger.info("================");
                    exports.logger.info("    START");
                    exports.logger.info("================");
                    return [4 /*yield*/, readConfig()];
                case 1:
                    config = _c.sent();
                    services = Object.entries(config.services);
                    exports.logger.info("Found " + services.length + " services:" + services
                        .map(function (_a) {
                        var _b = tslib_1.__read(_a, 2), serviceName = _b[0], serviceConfig = _b[1];
                        return serviceName;
                    })
                        .join(', '));
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    exports.logger.info("Target directory: " + outputDirectory);
                    return [4 /*yield*/, fs_1.promises.mkdir(outputDirectory)];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _c.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _c.trys.push([5, 16, 17, 18]);
                    services_1 = tslib_1.__values(services), services_1_1 = services_1.next();
                    _c.label = 6;
                case 6:
                    if (!!services_1_1.done) return [3 /*break*/, 15];
                    _a = tslib_1.__read(services_1_1.value, 2), serviceName = _a[0], serviceConfig = _a[1];
                    exports.logger.info("Processing " + serviceName);
                    targetFolderPath = path_1.join(outputDirectory, serviceName);
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, fs_1.promises.mkdir(targetFolderPath)];
                case 8:
                    _c.sent();
                    return [3 /*break*/, 10];
                case 9:
                    err_4 = _c.sent();
                    return [3 /*break*/, 10];
                case 10:
                    _c.trys.push([10, 13, , 14]);
                    return [4 /*yield*/, readEdmxFile(serviceName)];
                case 11:
                    edmxFile = _c.sent();
                    // await promises.writeFile(
                    //   targetFolderPath + '/edmx.tmp.json',
                    //   JSON.stringify(edmxFile, null, '\t')
                    // );
                    return [4 /*yield*/, processService(edmxFile, serviceConfig, targetFolderPath)];
                case 12:
                    // await promises.writeFile(
                    //   targetFolderPath + '/edmx.tmp.json',
                    //   JSON.stringify(edmxFile, null, '\t')
                    // );
                    _c.sent();
                    return [3 /*break*/, 14];
                case 13:
                    err_5 = _c.sent();
                    exports.logger.error('Failed to process: ' + err_5.message);
                    exports.logger.error(err_5.stackTrace());
                    return [3 /*break*/, 14];
                case 14:
                    services_1_1 = services_1.next();
                    return [3 /*break*/, 6];
                case 15: return [3 /*break*/, 18];
                case 16:
                    e_1_1 = _c.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 18];
                case 17:
                    try {
                        if (services_1_1 && !services_1_1.done && (_b = services_1.return)) _b.call(services_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 18:
                    exports.logger.info("================");
                    exports.logger.info("     STOP");
                    exports.logger.info("================");
                    return [2 /*return*/];
            }
        });
    });
}
function processService(edmx, config, targetFolderPath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var context, _a, _b, _c, entityName, entityConfig, e_2_1;
        var e_2, _d;
        return tslib_1.__generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    exports.logger.info("================");
                    exports.logger.info("Processing service " + config.baseUrl);
                    exports.logger.info("================");
                    if (!config.entitySets)
                        return [2 /*return*/];
                    context = {
                        edmx: edmx,
                        targetFolderPath: targetFolderPath,
                        baseUrl: config.baseUrl,
                        codeLists: {},
                    };
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, 7, 8]);
                    _a = tslib_1.__values(Object.entries(config.entitySets)), _b = _a.next();
                    _e.label = 2;
                case 2:
                    if (!!_b.done) return [3 /*break*/, 5];
                    _c = tslib_1.__read(_b.value, 2), entityName = _c[0], entityConfig = _c[1];
                    return [4 /*yield*/, entitySet_1.generateEntitySet(context, entityName, entityConfig)];
                case 3:
                    _e.sent();
                    _e.label = 4;
                case 4:
                    _b = _a.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_2_1 = _e.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 8: return [4 /*yield*/, codeLists_1.generateCodelists(context)];
                case 9:
                    _e.sent();
                    return [4 /*yield*/, metadataFile_1.generateMetadataFile(edmx, targetFolderPath)];
                case 10:
                    _e.sent();
                    return [2 /*return*/];
            }
        });
    });
}
(function () {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var err_6;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, main()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    err_6 = _a.sent();
                    console.error('Failed to process!');
                    console.error(err_6);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
})();
//# sourceMappingURL=generate.js.map