"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEdmxFile = void 0;
function parseEdmxFile(edmxFile) {
    var result = {
        associations: {},
        entitySets: {},
        entityTypes: {},
    };
    edmxFile['edmx:Edmx']['edmx:DataServices'].forEach(function (ds) {
        return ds.Schema.forEach(function (schema) {
            schema.EntityType.forEach(function (entityType) {
                entityType.$$ = { Namespace: schema.$.Namespace };
                result.entityTypes[schema.$.Namespace + '.' + entityType.$.Name] = entityType;
            });
            schema.EntityContainer.forEach(function (container) {
                container.EntitySet.forEach(function (entitySet) {
                    result.entitySets[entitySet.$.Name] = entitySet;
                });
            });
            schema.Association.forEach(function (association) {
                result.associations[schema.$.Namespace + '.' + association.$.Name] = association;
            });
        });
    });
    return result;
}
exports.parseEdmxFile = parseEdmxFile;
//# sourceMappingURL=parseEdmxFile.js.map