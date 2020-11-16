"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.C4CService = void 0;
var tslib_1 = require("tslib");
var axios_1 = tslib_1.__importDefault(require("axios"));
function createAuthorizationHeader(credentials) {
    switch (credentials.kind) {
        case "bearer":
            return 'Bearer ' + credentials.token;
        case 'password':
            return 'Basic ' + Buffer.from(credentials.username + ':' + credentials.password).toString('base64');
        default:
            throw new Error('Unrecognized credentials');
    }
}
var C4CService = /** @class */ (function () {
    function C4CService(credentials) {
        this.axios = axios_1.default.create({
            baseURL: credentials.url,
            headers: {
                Authorization: createAuthorizationHeader(credentials)
            },
        });
    }
    C4CService.prototype.query = function (text) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.axios.get('/sap/c4c/odata/v1/' + text)];
                    case 1:
                        result = _c.sent();
                        return [2 /*return*/, (_b = (_a = result.data) === null || _a === void 0 ? void 0 : _a.d) === null || _b === void 0 ? void 0 : _b.results];
                }
            });
        });
    };
    return C4CService;
}());
exports.C4CService = C4CService;
//# sourceMappingURL=c4cService.js.map