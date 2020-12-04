"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodelistService = void 0;
var CodelistService = /** @class */ (function () {
    function CodelistService(odataService, useCache) {
        if (useCache === void 0) { useCache = true; }
        this.odataService = odataService;
        this.useCache = useCache;
        this.cache = {};
    }
    CodelistService.prototype.getCodeList = function (codeListFullUrl, logger) {
        var entriesPromise = null;
        if (this.useCache) {
            entriesPromise = this.cache[codeListFullUrl];
            if (entriesPromise) {
                return entriesPromise;
            }
        }
        entriesPromise = this.odataService
            .query(codeListFullUrl + "?$select=Code,Description", logger)
            // filter out metadata
            .then(function (list) {
            return (list || []).map(function (ce) { return ({ Code: ce.Code, Description: ce.Description }); });
        });
        if (this.useCache) {
            this.cache[codeListFullUrl] = entriesPromise;
        }
        return entriesPromise;
    };
    return CodelistService;
}());
exports.CodelistService = CodelistService;
//# sourceMappingURL=codelistService.js.map