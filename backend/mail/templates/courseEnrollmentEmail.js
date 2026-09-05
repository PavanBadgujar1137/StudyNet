exports.courseEnrollmentEmail = (courseName, name) => {
  return `<!DOCTYPE html>
  <html>
  
  <head>
      <meta charset="UTF-8">
      <title>Registration Confirmation</title>
      <style>
          body {
              background-color: #F3F4F6;
              font-family: Arial, sans-serif;
              font-size: 16px;
              line-height: 1.4;
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
              font-size: 18px;
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
  
          .cta {
              display: inline-block;
              padding: 12px 24px;
              background-color: #2563EB;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 9999px;
              font-size: 15px;
              font-weight: bold;
              margin-top: 20px;
              box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
          }
  
          .support {
              font-size: 14px;
              color: #9CA3AF;
              margin-top: 20px;
              border-top: 1px solid #E5E7EB;
              padding-top: 20px;
              text-align: center;
          }
  
          .highlight {
              font-weight: bold;
              color: #0D1B3D;
          }
      </style>
  
  </head>
  
  <body>
      <div class="container">
          <a href="https://openhand.live" class="brand-name">OpenHand</a>
          <div class="message">Registration Confirmation</div>
          <div class="body">
              <p>Dear ${name},</p>
              <p>You have successfully registered for the cohort space <span class="highlight">"${courseName}"</span>. We
                  are excited to have you join us!</p>
              <p>Please log in to your dashboard to access your cohort materials and start your practice journey.</p>
              <div style="text-align: center;">
                  <a class="cta" href="http://localhost:3000/dashboard">Go to Dashboard</a>
              </div>
          </div>
          <div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a
                  href="mailto:info@openhand.live">info@openhand.live</a>. We are here to help!</div>
      </div>
  </body>
  
  </html>`;
};
