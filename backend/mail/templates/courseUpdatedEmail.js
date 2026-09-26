exports.courseUpdatedEmail = (courseTitle, learnerName, practitionerName, updateSummary, courseUrl = "https://openhand.live/dashboard") => {
  return `<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Course Update Notification</title>
    <style>
        body {
            background-color: #F8FAFC;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 15px;
            line-height: 1.6;
            color: #1E293B;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 30px auto;
            padding: 36px;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid #E2E8F0;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }

        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #F1F5F9;
        }

        .brand-name {
            font-size: 26px;
            font-weight: 800;
            color: #0F172A;
            text-decoration: none;
            letter-spacing: -0.5px;
        }

        .brand-name span {
            color: #0284C7;
        }

        .badge {
            display: inline-block;
            margin-top: 10px;
            padding: 4px 14px;
            background-color: #EFF6FF;
            color: #1D4ED8;
            border: 1px solid #BFDBFE;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .content {
            padding: 24px 0;
            text-align: left;
        }

        .greeting {
            font-size: 17px;
            font-weight: 700;
            color: #0F172A;
            margin-bottom: 12px;
        }

        .course-card {
            background: linear-gradient(135deg, #F0F9FF 0%, #F5F3FF 100%);
            border: 1px solid #BAE6FD;
            border-radius: 14px;
            padding: 20px;
            margin: 20px 0;
        }

        .course-title {
            font-size: 18px;
            font-weight: 800;
            color: #0369A1;
            margin: 0 0 6px 0;
        }

        .practitioner-info {
            font-size: 13px;
            color: #64748B;
            font-weight: 600;
        }

        .update-box {
            background-color: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 14px 16px;
            margin-top: 14px;
            font-size: 14px;
            color: #334155;
            line-height: 1.5;
        }

        .cta-container {
            text-align: center;
            margin: 28px 0 10px;
        }

        .cta {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
        }

        .footer {
            font-size: 12.5px;
            color: #94A3B8;
            margin-top: 24px;
            border-top: 1px solid #F1F5F9;
            padding-top: 20px;
            text-align: center;
            line-height: 1.5;
        }

        .footer a {
            color: #64748B;
            text-decoration: underline;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <a href="https://openhand.live" class="brand-name">Open<span>Hand</span></a>
            <div><span class="badge">Course Update Notification</span></div>
        </div>
        <div class="content">
            <p class="greeting">Hello ${learnerName || "Learner"},</p>
            <p>Your enrolled course space has been updated with new content and revisions by your practitioner.</p>
            
            <div class="course-card">
                <div class="course-title">📖 ${courseTitle}</div>
                <div class="practitioner-info">Instructor: Dr. / Practitioner ${practitionerName || "Your Practitioner"}</div>
                
                ${updateSummary ? `
                <div class="update-box">
                    <strong>Recent Updates:</strong><br/>
                    ${updateSummary}
                </div>
                ` : ""}
            </div>

            <p>Log in to your OpenHand dashboard to explore the latest course videos, notes, and updated learning materials.</p>

            <div class="cta-container">
                <a class="cta" href="${courseUrl}">View Updated Course Materials →</a>
            </div>
        </div>
        <div class="footer">
            You received this notification because you are enrolled in or connected to this course on OpenHand.<br/>
            Need help? Contact support at <a href="mailto:support@openhand.live">support@openhand.live</a>.
        </div>
    </div>
</body>

</html>`;
};
