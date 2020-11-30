"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.C4CService = void 0;
var tslib_1 = require("tslib");
var axios_1 = tslib_1.__importDefault(require("axios"));
function createAuthorizationHeader(credentials) {
    switch (credentials.kind) {
        case 'bearer':
            return 'Bearer ' + credentials.token;
        case 'password':
            return ('Basic ' + Buffer.from(credentials.username + ':' + credentials.password).toString('base64'));
        default:
            throw new Error('Unrecognized credentials');
    }
}
var C4CService = /** @class */ (function () {
    function C4CService(credentials) {
        this.axios = axios_1.default.create({
            baseURL: credentials.url,
            headers: {
                Authorization: createAuthorizationHeader(credentials),
                'X-CSRF-Token': 'fetch',
            },
        });
    }
    C4CService.prototype.ensureCsrfToken = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (this.axios.defaults.headers['X-CSRF-Token'] === 'fetch') {
                    this.debugLogger('No X-CSRF-Token!');
                    throw new Error('No CSRD');
                }
                return [2 /*return*/];
            });
        });
    };
    C4CService.prototype.patch = function (text, obj) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureCsrfToken()];
                    case 1:
                        _a.sent();
                        url = '/sap/c4c/odata/v1/' + text;
                        if (this.debugLogger)
                            this.debugLogger('Sending PATCH ' + url);
                        return [4 /*yield*/, this.axios.patch(url, obj)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.data];
                }
            });
        });
    };
    C4CService.prototype.post = function (text, obj) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureCsrfToken()];
                    case 1:
                        _a.sent();
                        url = '/sap/c4c/odata/v1/' + text;
                        if (this.debugLogger)
                            this.debugLogger('Sending POST ' + url);
                        return [4 /*yield*/, this.axios.post(url, obj)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.data];
                }
            });
        });
    };
    C4CService.prototype.query = function (text) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url, result;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        url = '/sap/c4c/odata/v1/' + text;
                        if (this.debugLogger)
                            this.debugLogger('Querying ' + url);
                        return [4 /*yield*/, this.axios.get(url)];
                    case 1:
                        result = _c.sent();
                        this.axios.defaults.headers['X-CSRF-Token'] = result.headers['X-CSRF-Token'];
                        return [2 /*return*/, (_b = (_a = result.data) === null || _a === void 0 ? void 0 : _a.d) === null || _b === void 0 ? void 0 : _b.results];
                }
            });
        });
    };
    return C4CService;
}());
exports.C4CService = C4CService;
//# sourceMappingURL=c4cService.js.map