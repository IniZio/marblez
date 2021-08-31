declare module 'google-spreadsheet' {
  interface Sheet {
    getRows(): Promise<any[]>;
    async loadCells(range: any): any[];
  }
  
  export class GoogleSpreadsheet {
    constructor(sheetId: string);

    useServiceAccountAuth(json: any);

    loadInfo(): Promise<void>;
    sheetsByIndex: Sheet[];
  }
}
