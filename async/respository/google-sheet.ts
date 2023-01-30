import fs from 'fs';
import { google, sheets_v4 } from 'googleapis';
import path from 'path';


const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
];
const spreadSheetId = '1E5v8Ilbl1Vk8d_hIGIJSjnmp_bS5K-MtT6QD9vhAGfM';
// const spreadSheetId = '1s_PcdLtCjsHOWZNEbZffH5uWsgdKqv-iaZcfqwt5pUI';
const testSpreadSheetId = '1s_PcdLtCjsHOWZNEbZffH5uWsgdKqv-iaZcfqwt5pUI';
const snapshotSpreadSheetId = '1A8HAYl3OeEj_zetpD6HfGqUsW93nqXpn-f6oK3L45jI';

const json = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../marble-service-account.json')) as unknown as string);

const resolveColumnIndex = (n: number) : string => {const a=Math.floor(n/26); return a >= 0 ? resolveColumnIndex(a-1) + String.fromCharCode(65+(n%26)) : ''};

class GoogleSheetRespository {
  googleSheet: sheets_v4.Sheets
  jwtClient = new google.auth.JWT(
    json.client_email,
    null,
    json.private_key,
    SCOPES
  );
  spreadSheetId: string;
  snapshotSpreadSheetId?: string;

  constructor({ spreadSheetId: _spreadSheetId = spreadSheetId, snapshotSpreadSheetId }: {spreadSheetId?: string, snapshotSpreadSheetId?: string} = {}) {
    this.googleSheet = google.sheets('v4');
    this.spreadSheetId = _spreadSheetId;
    this.snapshotSpreadSheetId = snapshotSpreadSheetId
  }

  async init() {
    await new Promise((resolve, reject) => {
      this.jwtClient.authorize(function (err, tokens) {
        if (err) {
          reject(err);
          return;
        } else {
          resolve(undefined);
        }
      });
      google.options({ auth: this.jwtClient });
    })
    return this;
  }

  async getAllRows() {
    const res = await this.googleSheet.spreadsheets.values.get({
      auth: this.jwtClient,
      spreadsheetId: this.spreadSheetId,
      range: 'A1:CM'
    });
    return (res.data.values || []).slice(1);
  }

  async getRow(index: number | string) {
    const res = await this.googleSheet.spreadsheets.values.get({
      auth: this.jwtClient,
      spreadsheetId: this.spreadSheetId,
      range: `A${index}:CM${Number(index) + 1}`
    });
    return (res.data.values || [])[0];
  }

  async insertRow(row: any) {
    const values = [
      row
    ];

    await this.googleSheet.spreadsheets.values.append({
      spreadsheetId: this.spreadSheetId,
      range: 'A:A',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: values,
      },
    });
  }

  async updateCell(index: number, column: number, value: any) {
    const range = `${resolveColumnIndex(column)}${index}:${resolveColumnIndex(column)}${index}`;
    console.log('=== range', range);
    const values = [
      [value]
    ];
    const data = [{
      range,
      values,
    }]


    await this.googleSheet.spreadsheets.values.batchUpdate({
      spreadsheetId: this.spreadSheetId,
      requestBody: {
        valueInputOption: 'raw',
        data,
      },
    });
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
      spreadsheetId: this.spreadSheetId,
      requestBody: {
        valueInputOption: 'raw',
        data,
      },
    });
  }

  async snapshot() {
    if (!this.snapshotSpreadSheetId) {
      return;
    }

    const rse = await this.googleSheet.spreadsheets.get({
      spreadsheetId: this.snapshotSpreadSheetId
    });
    const expiredSheetId = rse.data.sheets[0].properties.sheetId
    const res = await this.googleSheet.spreadsheets.sheets.copyTo({
      auth: this.jwtClient,
      spreadsheetId: this.spreadSheetId,
      sheetId: 1623881788,
      requestBody: {
        destinationSpreadsheetId: this.snapshotSpreadSheetId,
      }
    })
    await this.googleSheet.spreadsheets.batchUpdate({
      spreadsheetId: this.snapshotSpreadSheetId,
      requestBody: {
        requests: [
          { deleteSheet: {
            sheetId: expiredSheetId
          } }
        ]
      }
    })
  }
}

export default new GoogleSheetRespository({
  spreadSheetId: spreadSheetId,
  snapshotSpreadSheetId: snapshotSpreadSheetId,
})

export const snapshotGoogleSheetRepository = new GoogleSheetRespository({ spreadSheetId: snapshotSpreadSheetId });
export const testGoogleSheetRepository = new GoogleSheetRespository({ spreadSheetId: testSpreadSheetId })
