/**
 * ============================================
 * NexaByte — Google Apps Script for Form Data
 * ============================================
 *
 * SETUP INSTRUCTIONS:
 * 
 * 1. Go to https://sheets.google.com and create a new spreadsheet
 * 
 * 2. Name the spreadsheet "NexaByte - Form Submissions"
 * 
 * 3. Add these headers in Row 1 (columns A through K):
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
 * 
 * 4. Go to Extensions > Apps Script
 * 
 * 5. Delete any existing code and paste ALL the code below
 * 
 * 6. Click "Deploy" > "New deployment"
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Click "Deploy"
 * 
 * 7. Copy the Web App URL
 * 
 * 8. Paste it in script.js where it says:
 *    const GOOGLE_SHEETS_URL = '';
 * 
 * DONE! Form submissions will now appear in your Google Sheet.
 * ============================================
 */

// Handle POST requests from the website
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet and first sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Append a new row with the form data
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
      data.referenceLink || ''
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing the endpoint)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'ok', 
      message: 'NexaByte form endpoint is active',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
