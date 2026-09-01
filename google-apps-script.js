/**
 * ============================================
 * ZetaShift Labs — Google Apps Script for Form Data
 * With Email Alerts & Google Drive File Attachments
 * ============================================
 *
 * SETUP INSTRUCTIONS:
 * 
 * 1. Go to https://sheets.google.com and open your spreadsheet
 *    "ZetaShift Labs - Form Submissions"
 * 
 * 2. Ensure Row 1 has headers in columns A through L:
 *    A: Timestamp
 *    B: Name
 *    C: Email
 *    D: Phone
 *    E: Company
 *    F: Services
 *    G: Budget
 *    H: Timeline
 *    I: Project Title
 *    J: Message
 *    K: Reference Link
 *    L: Attachments
 * 
 * 3. Go to Extensions > Apps Script
 * 4. Replace the code with ALL the code below
 * 5. Click "Deploy" > "Manage deployments" > Edit (pencil) > New version > Deploy
 * ============================================
 */

// Your notification email
const NOTIFICATION_EMAIL = 'girishshankaran.k@gmail.com';

// Handle POST requests from the website
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);

    // 1. Honeypot Anti-Spam Check
    if (data.honeypot && data.honeypot.trim() !== '') {
      // Silently ignore bots
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success', message: 'OK' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Handle File Attachments (Save to Google Drive)
    let fileUrls = [];
    if (data.attachments && Array.isArray(data.attachments) && data.attachments.length > 0) {
      try {
        let folder;
        const folderName = 'ZetaShift Website Attachments';
        const folders = DriveApp.getFoldersByName(folderName);
        if (folders.hasNext()) {
          folder = folders.next();
        } else {
          folder = DriveApp.createFolder(folderName);
        }

        data.attachments.forEach(function(att) {
          if (att.data && att.name) {
            const decoded = Utilities.base64Decode(att.data);
            const blob = Utilities.newBlob(decoded, att.type || 'application/octet-stream', att.name);
            const file = folder.createFile(blob);
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            fileUrls.push(file.getUrl());
          }
        });
      } catch (fileErr) {
        Logger.log('File upload error: ' + fileErr.toString());
      }
    }
    
    // 3. Append row to active Google Sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.company || '',
      data.services || '',
      data.budget || '',
      data.timeline || '',
      data.projectTitle || '',
      data.message || '',
      data.referenceLink || '',
      fileUrls.join('\n')
    ]);

    // 4. Send Instant Email Alert to Admin
    try {
      const recipient = NOTIFICATION_EMAIL || Session.getEffectiveUser().getEmail();
      const subject = `🚀 New Lead: ${data.projectTitle || 'Project Inquiry'} from ${data.name || 'Website Visitor'}`;
      
      const emailBodyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; color: #333;">
          <h2 style="color: #7b61ff; margin-top: 0;">New Project Inquiry — ZetaShift Labs</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Name:</td><td>${data.name || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${data.email}">${data.email || 'N/A'}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${data.phone || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Company:</td><td>${data.company || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Services:</td><td>${data.services || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Budget:</td><td>${data.budget || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Timeline:</td><td>${data.timeline || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Project Title:</td><td>${data.projectTitle || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Reference Link:</td><td>${data.referenceLink ? `<a href="${data.referenceLink}">${data.referenceLink}</a>` : 'None'}</td></tr>
            ${fileUrls.length > 0 ? `<tr><td style="padding: 8px 0; font-weight: bold;">Attachments:</td><td>${fileUrls.map((u, i) => `<a href="${u}">Attachment ${i+1}</a>`).join(', ')}</td></tr>` : ''}
          </table>
          <div style="margin-top: 20px; padding: 15px; background: #f9f9fc; border-left: 4px solid #7b61ff; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold;">Message:</p>
            <p style="margin: 8px 0 0; white-space: pre-wrap;">${data.message || 'No description provided'}</p>
          </div>
        </div>
      `;

      MailApp.sendEmail({
        to: recipient,
        subject: subject,
        htmlBody: emailBodyHtml
      });
    } catch (mailErr) {
      Logger.log('Mail error: ' + mailErr.toString());
    }
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (health check)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'ok', 
      message: 'ZetaShift Labs form endpoint is active',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
