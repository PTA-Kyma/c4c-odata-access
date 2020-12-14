"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.C4CService = void 0;
var tslib_1 = require("tslib");
var axios_1 = tslib_1.__importDefault(require("axios"));
var axios_cookiejar_support_1 = tslib_1.__importDefault(require("axios-cookiejar-support"));
var tough_cookie_1 = require("tough-cookie");
function createAuthorizationHeader(credentials) {
    switch (credentials.kind) {
        case 'pseudobearer':
            return 'Basic ' + credentials.token;
        case 'password':
            return ('Basic ' + Buffer.from(credentials.username + ':' + credentials.password).toString('base64'));
        default:
            throw new Error('Unrecognized credentials');
    }
}
var C4CService = /** @class */ (function () {
    function C4CService(credentials) {
        var jar = new tough_cookie_1.CookieJar();
        this.axios = axios_1.default.create({
            baseURL: credentials.url,
            headers: {
                Authorization: createAuthorizationHeader(credentials),
                Connection: 'keep-alive',
            },
            withCredentials: true,
            jar: jar,
        });
        axios_cookiejar_support_1.default(this.axios);
    }
    C4CService.prototype.ensureCsrfToken = function (text, logger) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.csrfToken) return [3 /*break*/, 2];
                        if (logger) {
                            logger('No X-CSRF-Token! Performing query...');
                        }
                        return [4 /*yield*/, this.query(text)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    C4CService.prototype.patch = function (text, obj, logger) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureCsrfToken(text, logger)];
                    case 1:
                        _a.sent();
                        url = '/sap/c4c/odata/' + text;
                        if (logger) {
                            logger('Sending PATCH ' + url);
                        }
                        return [4 /*yield*/, this.axios.patch(url, obj, {
                                headers: { 'X-CSRF-Token': this.csrfToken },
                                withCredentials: true,
                            })];
                    case 2:
                        result = _a.sent();
                        if (logger) {
                            logger("PATCH returned status " + result.status + " " + result.statusText);
                        }
                        return [2 /*return*/, result.data];
                }
            });
        });
    };
    C4CService.prototype.post = function (text, obj, logger) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureCsrfToken(text, logger)];
                    case 1:
                        _a.sent();
                        url = '/sap/c4c/odata/' + text;
                        if (logger) {
                            logger('Sending POST ' + url);
                        }
                        return [4 /*yield*/, this.axios.post(url, obj, {
                                headers: { 'X-CSRF-Token': this.csrfToken },
                                withCredentials: true,
                            })];
                    case 2:
                        result = _a.sent();
                        if (logger) {
                            logger("POST returned status " + result.status + " " + result.statusText);
                        }
                        return [2 /*return*/, result.data];
                }
            });
        });
    };
    C4CService.prototype.query = function (text, logger) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var url, options, result, newCsrfToken;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        url = '/sap/c4c/odata/' + text;
                        if (logger) {
                            logger('Querying ' + url);
                        }
                        options = { headers: {}, withCredentials: true };
                        if (!this.csrfToken) {
                            options.headers['X-CSRF-Token'] = 'fetch';
                        }
                        return [4 /*yield*/, this.axios.get(url, options)];
                    case 1:
                        result = _c.sent();
                        if (logger) {
                            logger("Query returned status " + result.status + " " + result.statusText);
                        }
                        newCsrfToken = result.headers['x-csrf-token'];
                        if (newCsrfToken) {
                            this.csrfToken = newCsrfToken;
                            if (logger) {
                                logger('New CSRF Token: ' + this.csrfToken);
                            }
                        }
                        return [2 /*return*/, (_b = (_a = result.data) === null || _a === void 0 ? void 0 : _a.d) === null || _b === void 0 ? void 0 : _b.results];
                }
            });
        });
    };
    return C4CService;
}());
exports.C4CService = C4CService;
//# sourceMappingURL=c4cService.js.map