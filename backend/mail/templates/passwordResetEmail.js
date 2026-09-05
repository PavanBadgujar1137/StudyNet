exports.passwordResetEmail = (resetUrl, name = "User") => {
  return `<!DOCTYPE html>
  <html>
  
  <head>
      <meta charset="UTF-8">
      <title>Password Reset Request</title>
      <style>
          body {
              background-color: #F3F4F6;
              font-family: Arial, sans-serif;
              font-size: 16px;
              line-height: 1.5;
              color: #0D1B3D;
              margin: 0;
              padding: 0;
          }
  
          .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 30px;
              background-color: #ffffff;
              border-radius: 12px;
              border: 1px solid #E5E7EB;
              text-align: center;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
  
          .brand-name {
              font-size: 24px;
              font-weight: bold;
              color: #0D1B3D;
              text-decoration: none;
              margin-bottom: 20px;
              display: block;
          }
  
          .message {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #2563EB;
          }
  
          .body {
              font-size: 16px;
              margin-bottom: 20px;
              text-align: left;
              color: #4B5563;
          }
  
          .cta-container {
              text-align: center;
              margin: 28px 0;
          }
  
          .cta {
              display: inline-block;
              padding: 14px 28px;
              background-color: #2563EB;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: bold;
              box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.25);
          }
  
          .raw-url {
              word-break: break-all;
              font-size: 13px;
              color: #2563EB;
              margin-top: 15px;
          }
  
          .support {
              font-size: 14px;
              color: #9CA3AF;
              margin-top: 25px;
              border-top: 1px solid #E5E7EB;
              padding-top: 20px;
              text-align: center;
          }
      </style>
  </head>
  
  <body>
      <div class="container">
          <a href="https://openhand.live" class="brand-name">OpenHand</a>
          <div class="message">Password Reset Request</div>
          <div class="body">
              <p>Hi ${name},</p>
              <p>We received a request to reset your password for your OpenHand account. Click the button below to choose a new password:</p>
              
              <div class="cta-container">
                  <a class="cta" href="${resetUrl}" target="_blank">Reset Password</a>
              </div>

              <p style="font-size: 14px; color: #6B7280;">If the button above doesn't work, copy and paste this link into your browser address bar:</p>
              <div class="raw-url"><a href="${resetUrl}">${resetUrl}</a></div>

              <p style="margin-top: 20px; font-size: 14px; color: #6B7280;">This password reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          <div class="support">
              If you have any questions or need assistance, please contact us at 
              <a href="mailto:info@openhand.live" style="color: #2563EB;">info@openhand.live</a>.
          </div>
      </div>
  </body>
  
  </html>`
}
