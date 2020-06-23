import fs from 'fs';
import path from 'path';
import {google, GoogleApis, sheets_v4} from 'googleapis';


const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const sheetId = '1E5v8Ilbl1Vk8d_hIGIJSjnmp_bS5K-MtT6QD9vhAGfM';
// const sheetId = '1G76j4h_FYCdPGcMpRVfVYh_wiTGGG1TKEDmLiIrpCkE';

const json = JSON.parse(process.env.SERVICE_ACCOUNT_KEY_FILE || fs.readFileSync(path.resolve(__dirname, '../../marble-service-account.json')) as unknown as string);

const resolveColumnIndex = (n: number) : string => {const a=Math.floor(n/26); return a >= 0 ? resolveColumnIndex(a-1) + String.fromCharCode(65+(n%26)) : ''};

class GoogleSheetRespository {
  googleSheet: sheets_v4.Sheets
  jwtClient = new google.auth.JWT(
    json.client_email,
    null,
    json.private_key,
    SCOPES
  );
  
  constructor() {
    this.googleSheet = google.sheets('v4');
  }

  async init() {
    await new Promise((resolve, reject) => {
      this.jwtClient.authorize(function (err, tokens) {
        if (err) {
          reject(err);
          return;
        } else {
          resolve();
        }
      });
      google.options({ auth: this.jwtClient });
    })
    return this;
  }

  async getAllRows() {
    const res = await this.googleSheet.spreadsheets.values.get({
      auth: this.jwtClient,
      spreadsheetId: sheetId,
      range: 'A1:CM'
    });
    return (res.data.values || []).slice(1);
  }

  async getRow(index: number | string) {
    const res = await this.googleSheet.spreadsheets.values.get({
      auth: this.jwtClient,
      spreadsheetId: sheetId,
      range: `A${index}:CM${Number(index) + 1}`
    });
    return (res.data.values || [])[0];
  }

  async updateRow(index: any, row: any) {
    const range =  `A${index}:ZZ${index}`;
    const values = [
      row
    ];
    const data = [{
      range,
      values,
    }]
    
    
    await this.googleSheet.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: 'raw',
        data,
      },
    });
  }
}

export default new GoogleSheetRespository()
