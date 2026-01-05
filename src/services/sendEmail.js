const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

// General email sending function
async function sendEmail(to, subject, html, attachments = []) {
    try {
        const mailOptions = {
            from: `"Secure Voice System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        // Add attachments if provided
        if (attachments && attachments.length > 0) {
            mailOptions.attachments = attachments;
        }

        await transporter.sendMail(mailOptions);

        console.log("Email sent to:", to);
        return true;

    } catch (err) {
        console.error("Email sending failed:", err);
        return false;
    }
}

// Function specifically for sending complaint/harassment reports
async function sendComplaintEmail(complaintData, caseId) {
    const { name, email, phone, complaintType, description, location, incidentDate, files } = complaintData;

    // ✅ Generate dashboard URL
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/authority.html?caseId=${caseId}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background-color: #f5f5f5; padding: 20px; }
                .section { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #d32f2f; }
                .field { margin: 10px 0; }
                .label { font-weight: bold; color: #555; }
                .value { color: #333; margin-left: 10px; }
                .description-box { background-color: #f9f9f9; padding: 15px; border-radius: 3px; margin-top: 10px; white-space: pre-wrap; }
                .attachments { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #ddd; }
                .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
                .cta-button { 
                    display: inline-block; 
                    background-color: #2563eb; 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    margin: 20px 0;
                    text-align: center;
                }
                .cta-button:hover { background-color: #1d4ed8; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🔒 New Harassment/Complaint Report</h2>
                    <p>Secure Voice System - Kenya</p>
                </div>
                
                <div class="content">
                    <div class="warning">
                        <strong>⚠️ URGENT:</strong> This is a harassment/complaint report that requires immediate attention.
                    </div>

                    <!-- ✅ CTA Button to Dashboard -->
                    <div style="text-align: center; background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                        <h3 style="margin-top: 0;">📋 View Report in Dashboard</h3>
                        <p style="color: #666; margin-bottom: 15px;">Click below to view full details and manage this report</p>
                        <a href="${dashboardUrl}" class="cta-button">
                            🔍 Open Authority Dashboard
                        </a>
                        <p style="font-size: 12px; color: #999; margin-top: 10px;">
                            Case ID: <strong>${caseId}</strong><br>
                            Opening this link will automatically mark the report as "Under Review"
                        </p>
                    </div>

                    <div class="section">
                        <h3>👤 Reporter Information</h3>
                        <div class="field">
                            <span class="label">Name:</span>
                            <span class="value">${name || 'Anonymous'}</span>
                        </div>
                        <div class="field">
                            <span class="label">Email:</span>
                            <span class="value">${email || 'Not provided'}</span>
                        </div>
                        <div class="field">
                            <span class="label">Phone:</span>
                            <span class="value">${phone || 'Not provided'}</span>
                        </div>
                        ${location ? `
                        <div class="field">
                            <span class="label">Location:</span>
                            <span class="value">${location}</span>
                        </div>
                        ` : ''}
                    </div>

                    <div class="section">
                        <h3>📋 Incident Details</h3>
                        <div class="field">
                            <span class="label">Complaint Type:</span>
                            <span class="value" style="color: #d32f2f; font-weight: bold;">${complaintType}</span>
                        </div>
                        ${incidentDate ? `
                        <div class="field">
                            <span class="label">Incident Date:</span>
                            <span class="value">${new Date(incidentDate).toLocaleDateString()}</span>
                        </div>
                        ` : ''}
                        <div class="field">
                            <span class="label">Description:</span>
                            <div class="description-box">${description}</div>
                        </div>
                    </div>

                    ${files && files.length > 0 ? `
                    <div class="attachments">
                        <h3>📎 Evidence Attached</h3>
                        <p><strong>${files.length}</strong> file(s) attached to this email:</p>
                        <ul>
                            ${files.map(file => `
                                <li>
                                    <strong>${file.originalname || file.filename}</strong>
                                    <br>
                                    <small>Type: ${file.mimetype} | Size: ${(file.size / 1024).toFixed(2)} KB</small>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    ` : `
                    <div class="attachments">
                        <p>No files were attached to this report.</p>
                    </div>
                    `}

                    <div class="section">
                        <h3>📅 Report Metadata</h3>
                        <div class="field">
                            <span class="label">Submitted:</span>
                            <span class="value">${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}</span>
                        </div>
                        <div class="field">
                            <span class="label">Report ID:</span>
                            <span class="value">${caseId}</span>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>This is an automated message from the Secure Voice System.</p>
                    <p>Please handle this report with confidentiality and urgency.</p>
                    <p style="color: #d32f2f; font-weight: bold;">⚠️ Do not reply to this email. Use the dashboard to manage reports.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Prepare attachments for nodemailer
    const attachments = files ? files.map(file => ({
        filename: file.originalname || file.filename,
        path: file.path, // File path on server
    })) : [];

    const subject = `🚨 URGENT: New ${complaintType} Report - Case ${caseId}`;
    
    return await sendEmail(process.env.SECURE_VOICE_EMAIL, subject, html, attachments);
}

// Function to send confirmation email to the reporter
async function sendConfirmationEmail(reporterEmail, complaintData) {
    const { name, complaintType } = complaintData;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4caf50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background-color: #f5f5f5; padding: 20px; border-radius: 0 0 5px 5px; }
                .message { background-color: white; padding: 20px; border-radius: 5px; margin: 15px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .highlight { color: #4caf50; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>✅ Report Submitted Successfully</h2>
                </div>
                
                <div class="content">
                    <div class="message">
                        <p>Dear ${name || 'Reporter'},</p>
                        
                        <p>Thank you for submitting your <strong>${complaintType}</strong> report through the Secure Voice System.</p>
                        
                        <p>Your report has been received and forwarded to the relevant authorities. Here's what happens next:</p>
                        
                        <ul>
                            <li>Your report will be reviewed within 24-48 hours</li>
                            <li>Authorities may contact you for additional information</li>
                            <li>All information will be handled with strict confidentiality</li>
                            <li>You will be updated on the progress of your case</li>
                        </ul>

                        <p><strong>Submitted on:</strong> ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}</p>

                        <p style="margin-top: 20px;">If you need immediate assistance or your safety is at risk, please contact:</p>
                        <ul>
                            <li><strong>Police Emergency:</strong> 999 or 112</li>
                            <li><strong>Gender Violence Recovery Centre:</strong> 0709 400 200</li>
                            <li><strong>National Police Service:</strong> 0203 341 411</li>
                        </ul>
                    </div>
                </div>

                <div class="footer">
                    <p>Secure Voice System - Standing Against Harassment</p>
                    <p>This is an automated confirmation. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const subject = "✅ Your Report Has Been Received - Secure Voice Kenya";
    
    return await sendEmail(reporterEmail, subject, html);
}

module.exports = { 
    sendEmail, 
    sendComplaintEmail,
    sendConfirmationEmail 
};