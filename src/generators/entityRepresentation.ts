import { EdmxEntityType } from '../edmx.model';
import { TypescriptOperationConfig } from '../config.model';
import { ParsedEdmxFile } from '../parseEdmxFile';

export function generateEntityRepresentation(
  outputLines: string[],
  operation: TypescriptOperationConfig,
  operationName: string,
  entityType: EdmxEntityType,
  edmx: ParsedEdmxFile
) {
  const expandedProperties: {
    name: string;
    type: string;
    singleOrArray: 'single' | 'array';
  }[] = [];

  if (operation.expand) {
    operation.expand.forEach((navigationPropertyName) => {
      const navigationProperty = entityType.NavigationProperty.find(
        (p) => p.$.Name === navigationPropertyName
      );
      if (!navigationProperty) {
        throw new Error(
          `NavigationProperty ${navigationPropertyName} on entity type ${entityType.$.Name} not found!`
        );
      }

      const childEntityTypeName = entityType.$$.Namespace + '.' + navigationProperty.$.ToRole;
      const childEntityType = edmx.entityTypes[childEntityTypeName];
      if (!childEntityType) {
        throw new Error(
          `Target EntityType ${childEntityTypeName} not found for NavigationProperty ${navigationPropertyName} on entity type ${entityType.$.Name}`
        );
      }

      const childEntityName = `${entityType.$.Name}_${operationName}_${navigationProperty.$.ToRole}`;
      outputLines.push(`export interface ${childEntityName} {`);
      childEntityType.Property.forEach((property) => {
        const name = property.$.Name;
        const nullable = property.$.Nullable === 'true';
        const type = getPropertyType(property.$.Type);
        outputLines.push(`${name}${nullable ? '?' : ''}: ${type}`);
      });
      outputLines.push('}');

      const association = edmx.associations[navigationProperty.$.Relationship];
      if (!association) {
        throw new Error(`No association ${navigationProperty.$.Relationship}`);
      }
      const associationEnd = association.End.find((e) => e.$.Type === childEntityTypeName);
      if (!associationEnd) {
        throw new Error(`No association end with role ${childEntityTypeName}`);
      }

      expandedProperties.push({
        name: navigationPropertyName,
        type: childEntityName,
        singleOrArray: associationEnd.$.Multiplicity === '1' ? 'single' : 'array',
      });
    });
  }

  outputLines.push(`export interface ${operation.entityName} {`);
  operation.properties.forEach((p) => {
    const property = entityType.Property.find((p1) => p1.$.Name === p);
    if (!property) {
      throw new Error(`Unknown property ${p}`);
    }
    const name = property.$.Name;
    const nullable = property.$.Nullable === 'true';
    const type = getPropertyType(property.$.Type);
    outputLines.push(`${name}${nullable ? '?' : ''}: ${type}`);
  });
  expandedProperties.forEach(({ name, type, singleOrArray }) => {
    outputLines.push(`${name}: ${type}${singleOrArray === 'single' ? '' : '[]'};`);
  });
  outputLines.push(`}\r\n`);
}

export function getPropertyType(xmlType: string): string {
  switch (xmlType) {
    case 'Edm.Int32':
    case 'Edm.Int16':
      return 'number';
    case 'Edm.String':
    default:
      return 'string';
  }
}
