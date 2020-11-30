"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyType = exports.generateEntityRepresentation = void 0;
function generateEntityRepresentation(outputLines, operation, operationName, entityType, edmx) {
    var expandedProperties = [];
    if (operation.expand) {
        operation.expand.forEach(function (navigationPropertyName) {
            var navigationProperty = entityType.NavigationProperty.find(function (p) { return p.$.Name === navigationPropertyName; });
            if (!navigationProperty) {
                throw new Error("NavigationProperty " + navigationPropertyName + " on entity type " + entityType.$.Name + " not found!");
            }
            var childEntityTypeName = entityType.$$.Namespace + '.' + navigationProperty.$.ToRole;
            var childEntityType = edmx.entityTypes[childEntityTypeName];
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
            var association = edmx.associations[navigationProperty.$.Relationship];
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
exports.generateEntityRepresentation = generateEntityRepresentation;
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
//# sourceMappingURL=entityRepresentation.js.map