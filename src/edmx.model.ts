export interface EdmxFile {
  'edmx:Edmx': {
    'edmx:DataServices': {
      Schema: EdmxSchema[];
    }[];
  };
}

export interface EdmxEntitySet {
  $: {
    Name: string;
    EntityType: string;
    'sap:creatable'?: 'true' | 'false';
    'sap:updatable'?: 'true' | 'false';
    'sap:deletable'?: 'true' | 'false';
    'sap:semantics'?: string;
    'sap:label'?: string;
  };
}

export interface EdmxEntityType {
  $: {
    Name: string;
    'c4c:parent-entity-type'?: string;
  };
  Key: [{ PropertyRef: { $: { Name: string } }[] }];
  Property: EdmxProperty[];
  NavigationProperty: EdmxNavigationProperty[];
  $$: {
    Namespace: string;
  };
}

export interface EdmxProperty {
  $: {
    Name: string;
    Type: string;
    Nullable: 'true' | 'false';
    MaxLength?: string;
    Precision?: string;
    Scale?: string;
    FixedLength?: 'true' | 'false';
    'sap:creatable': 'true' | 'false';
    'sap:updatable': 'true' | 'false';
    'sap:filterable': 'true' | 'false';
    'sap:display-format'?: string;
    'sap:text'?: string;
    'c4c:value-help'?: string;
    'sap:label'?: string;
    'c4c:context-property'?: string;
  };
}

export interface EdmxNavigationProperty {
  $: {
    Name: string;
    Relationship: string;
    FromRole: string;
    ToRole: string;
  };
}

export interface EdmxSchema {
  $: { Namespace: string };
  EntityContainer: { EntitySet: EdmxEntitySet[] }[];
  EntityType: EdmxEntityType[];
  ComplexType: EdmxComplexType[];
  Association: EdmxAssociation[];
}

export interface EdmxComplexType {
  $: {
    Name: string;
  };
  Property: EdmxProperty[];
}

export interface EdmxAssociation {
  $: {
    Name: string;
  };
  End: EdmxAssociationEnd[];
}

export interface EdmxAssociationEnd {
  $: {
    Type: string;
    Multiplicity: '1' | '*';
    Role: string;
  };
}
