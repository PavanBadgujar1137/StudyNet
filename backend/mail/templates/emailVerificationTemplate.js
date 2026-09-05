const otpTemplate = (otp) => {
	return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>OTP Verification Email</title>
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
				font-size: 28px;
				color: #2563EB;
				text-align: center;
				margin: 20px 0;
				letter-spacing: 2px;
			}
		</style>
	
	</head>
	
	<body>
		<div class="container">
			<a href="https://openhand.live" class="brand-name">OpenHand</a>
			<div class="message">OTP Verification</div>
			<div class="body">
				<p>Dear User,</p>
				<p>Thank you for registering with OpenHand. To complete your registration, please use the following OTP
					(One-Time Password) to verify your account:</p>
				<div class="highlight">${otp}</div>
				<p>This OTP is valid for 5 minutes. If you did not request this verification, please disregard this email.
				Once your account is verified, you will have access to our platform and its features.</p>
			</div>
			<div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a
					href="mailto:info@openhand.live">info@openhand.live</a>. We are here to help!</div>
		</div>
	</body>
	
	</html>`;
};
module.exports = otpTemplate;
