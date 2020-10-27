
  export interface ODataService { 
    query<T>(text: string): Promise<T>; 
  }
  