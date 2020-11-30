import { Config } from './config.model';
import { EdmxAssociation, EdmxEntitySet, EdmxEntityType, EdmxFile } from './edmx.model';

export interface ParsedEdmxFile {
  entityTypes: { [name: string]: EdmxEntityType };
  entitySets: { [name: string]: EdmxEntitySet };
  associations: { [name: string]: EdmxAssociation };
}

export function parseEdmxFile(edmxFile: EdmxFile): ParsedEdmxFile {
  const result: ParsedEdmxFile = {
    associations: {},
    entitySets: {},
    entityTypes: {},
  };
  edmxFile['edmx:Edmx']['edmx:DataServices'].forEach((ds) =>
    ds.Schema.forEach((schema) => {
      schema.EntityType.forEach((entityType) => {
        entityType.$$ = { Namespace: schema.$.Namespace };
        result.entityTypes[schema.$.Namespace + '.' + entityType.$.Name] = entityType;
      });

      schema.EntityContainer.forEach((container) => {
        container.EntitySet.forEach((entitySet) => {
          result.entitySets[entitySet.$.Name] = entitySet;
        });
      });

      schema.Association.forEach((association) => {
        result.associations[schema.$.Namespace + '.' + association.$.Name] = association;
      });
    })
  );

  return result;
}
