import fs from 'fs';
import path from 'path';
import {google, GoogleApis, sheets_v4} from 'googleapis';
import { AuthPlus } from 'googleapis/build/src/googleapis';


const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const sheetId = '1E5v8Ilbl1Vk8d_hIGIJSjnmp_bS5K-MtT6QD9vhAGfM';

const json = JSON.parse(process.env.SERVICE_ACCOUNT_KEY_FILE || fs.readFileSync(path.resolve(__dirname, '../../marble-service-account.json')) as unknown as string);

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
    })
    return this;
  }

  async getAllRows() {
    const res = await this.googleSheet.spreadsheets.values.get({
      auth: this.jwtClient,
      spreadsheetId: sheetId,
      range: 'A1:AC'
    });
    return (res.data.values || []).slice(1);
  }
}

export default new GoogleSheetRespository()
