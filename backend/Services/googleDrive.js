const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

let serviceAccount;
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} else {
  serviceAccount = require('../eventwebsite-465606-93e1d6bf3289.json');
}

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

const uploadToGoogleDrive = async (file) => {
  const fileMetadata = {
    name: file.originalname,
    parents: ['1lXrkSHCjbGwM3-2YciSxPzJhhHN238ea'], // your Google Drive folder ID
  };
  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };
  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink',
  });
  fs.unlinkSync(file.path); // Remove temp file
  return {
    fileId: response.data.id,
    webViewLink: response.data.webViewLink,
    webContentLink: response.data.webContentLink,
  };
};

module.exports = { uploadToGoogleDrive };
