"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDefaultsWhereMissing = exports.defaultOperations = void 0;
var tslib_1 = require("tslib");
function defaultOperations(entityType) {
    return {
        query: {
            entityName: entityType.$.Name + 'QueryModel',
            type: 'query',
            // properties: entityType.Property.map((p) => p.$.Name),
            onlySelectedProperties: false,
        },
        fetch: {
            entityName: entityType.$.Name,
            type: 'fetch',
            // properties: entityType.Property.map((p) => p.$.Name),
            onlySelectedProperties: false,
        },
    };
}
exports.defaultOperations = defaultOperations;
function setupDefaultsWhereMissing(entitySetName, entityType, operations) {
    Object.entries(operations).forEach(function (_a) {
        var _b = tslib_1.__read(_a, 2), name = _b[0], o = _b[1];
        switch (o.type) {
            case null:
            case undefined:
                throw new Error('Missing operation type for entity ' + entitySetName);
        }
        if (!o.entityName) {
            o.entityName = entityType.$.Name + "_" + name + "_Model";
        }
        if (o.properties) {
            o.onlySelectedProperties = true;
        }
        else {
            switch (o.type) {
                case 'query':
                case 'fetch':
                    o.properties = entityType.Property.map(function (p) { return p.$.Name; });
                    break;
                case 'update':
                    o.properties = entityType.Property.filter(function (p) { return p.$['sap:updatable'] === 'true'; }).map(function (p) { return p.$.Name; });
                    break;
                case 'create':
                    o.properties = entityType.Property.filter(function (p) { return p.$['sap:creatable'] === 'true'; }).map(function (p) { return p.$.Name; });
                    break;
                case 'delete':
                    // do nothing
                    o.properties = [];
                    break;
                default:
                    throw new Error("setupDefaultsWhereMissing: Setting defaults for " + o.type + " operation '" + name + "' not implemented yet ");
            }
        }
    });
}
exports.setupDefaultsWhereMissing = setupDefaultsWhereMissing;
//# sourceMappingURL=config.model.js.map