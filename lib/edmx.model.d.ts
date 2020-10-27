export interface EntitySet {
    $: {
        Name: string;
        EntityType: string;
    };
}
export interface EntityType {
    $: {
        Name: string;
    };
    Key: [{
        PropertyRef: any;
    }];
    Property: Property[];
    NavigationProperty: NavigationProperty[];
}
export interface Property {
    $: {
        Name: string;
        Type: string;
        Nullable: 'true' | 'false';
        MaxLength?: string;
        Precision?: string;
        FixedLength?: 'true' | 'false';
        'sap:creatable': 'true' | 'false';
        'sap:updatable': 'true' | 'false';
        'sap:filterable': 'true' | 'false';
        'sap:display-format'?: string;
        'sap:text'?: string;
        'c4c:value-help'?: string;
    };
}
export interface NavigationProperty {
    $: {
        Name: string;
        Relationship: string;
        FromRole: string;
        ToRole: string;
    };
}
export interface Schema {
    EntityContainer: {
        EntitySet: EntitySet[];
    }[];
    EntityType: EntityType[];
    ComplexType: ComplexType[];
    Association: Association[];
}
export interface ComplexType {
    $: {
        Name: string;
    };
    Property: Property[];
}
export interface Association {
    $: {
        Name: string;
    };
    End: AssociationEnd[];
}
export interface AssociationEnd {
    $: {
        Type: string;
        Multiplicity: '1' | '*';
        Role: string;
    };
}
