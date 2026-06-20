const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { google } = require('googleapis');

async function test() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  let formattedPrivateKey = privateKey.trim();
  if (formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) {
    formattedPrivateKey = formattedPrivateKey.substring(1, formattedPrivateKey.length - 1);
  }
  formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: formattedPrivateKey,
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const listResponse = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, createdTime)',
  });

  const files = listResponse.data.files || [];
  if (files.length === 0) {
    console.log('No files found.');
    return;
  }

  const file = files[0];
  console.log(`Fetching file: "${file.name}" (ID: ${file.id})`);

  // Plain text
  const textResponse = await drive.files.export({
    fileId: file.id,
    mimeType: 'text/plain',
  });
  console.log('--- PLAIN TEXT START ---');
  console.log(textResponse.data.substring(0, 500));
  console.log('--- PLAIN TEXT END ---');

  // HTML
  const htmlResponse = await drive.files.export({
    fileId: file.id,
    mimeType: 'text/html',
  });
  console.log('--- HTML START (first 500 chars) ---');
  console.log(htmlResponse.data.substring(0, 500));
  console.log('--- HTML END ---');

  // Let's save both to local files so we can inspect
  fs.writeFileSync('debug-plain.txt', textResponse.data);
  fs.writeFileSync('debug-html.html', htmlResponse.data);
  console.log('Saved debug-plain.txt and debug-html.html');
}

test().catch(console.error);
