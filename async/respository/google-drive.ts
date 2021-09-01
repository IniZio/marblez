import fs from 'fs';
import stream from "stream"
import { google } from 'googleapis';
import path from 'path';

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
];

const json = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../marble-service-account.json')) as unknown as string);

const resolveColumnIndex = (n: number) : string => {const a=Math.floor(n/26); return a >= 0 ? resolveColumnIndex(a-1) + String.fromCharCode(65+(n%26)) : ''};

class GoogleDriveRespository {
  googleDrive = google.drive("v3")
  jwtClient = new google.auth.JWT(
    json.client_email,
    null,
    json.private_key,
    SCOPES
  );
  spreadSheetId: string;
  snapshotSpreadSheetId?: string;

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

  async getAllFolders() {
    const res = await this.googleDrive.files.list({
      auth: this.jwtClient,
      q: `mimeType='application/vnd.google-apps.folder' and name contains 'marblez'`,
    })

    return res.data.files
  }

  async uploadFile(buffer: Buffer, filename: string) {
    const [folder] = await this.getAllFolders();

    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const { data: { files } } = await this.googleDrive.files.list({
      auth: this.jwtClient,
      q: `name contains '${filename}'`,
    })

    console.log("=== files found", files)

    if (files.length) {
      return;
    }

    const res = await this.googleDrive.files.create({
      requestBody: {
        name: filename,
        parents: [folder.id],
      },
      media: {
        mimeType: "image/jpeg",
        body: bufferStream,
      }
    })

    console.log("=== res", res);
  }
}

export default new GoogleDriveRespository()
