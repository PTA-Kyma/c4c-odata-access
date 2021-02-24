"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodelistService = void 0;
var CodelistService = /** @class */ (function () {
    function CodelistService(odataService, cache) {
        if (cache === void 0) { cache = null; }
        this.odataService = odataService;
        this.cache = cache;
    }
    CodelistService.prototype.getCodeList = function (codeListFullUrl, logger) {
        var entriesPromise = null;
        if (this.cache) {
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
        if (this.cache) {
            this.cache[codeListFullUrl] = entriesPromise;
        }
        return entriesPromise;
    };
    return CodelistService;
}());
exports.CodelistService = CodelistService;
//# sourceMappingURL=codelistService.js.map