// mail/Varification/passwordResetTemplate.js
exports.passwordResetTemplate = (name = "User", resetUrl) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset Request</title>
  <style>
    body {
      background-color: #f4f4f7;
      font-family: Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #333333;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      text-align: center;
    }

    .logo {
      max-width: 150px;
      margin-bottom: 20px;
    }

    .heading {
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #111827;
    }

    .message {
      font-size: 16px;
      margin-bottom: 20px;
    }

    .cta-button {
      display: inline-block;
      padding: 12px 25px;
      background: linear-gradient(90deg, #FFD60A, #FFB700);
      color: #000000;
      text-decoration: none;
      font-weight: bold;
      border-radius: 6px;
      margin-top: 15px;
    }

    .support {
      font-size: 14px;
      color: #666666;
      margin-top: 20px;
    }

    @media only screen and (max-width: 600px) {
      .container {
        padding: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Logo -->
    <img class="logo" src="https://i.ibb.co/7Xyj3PC/logo.png" alt="Ed.Tech Logo">

    <!-- Heading -->
    <div class="heading">Password Reset Request</div>

    <!-- Greeting -->
    <div class="message">
      Hi ${name},<br>
      We received a request to reset your password. Click the button below to reset it. This link is valid for 5 minutes.
    </div>

    <!-- CTA button -->
    <a href="${resetUrl}" class="cta-button">Reset Password</a>

    <!-- Fallback -->
    <div class="message">
      If the button doesn’t work, copy and paste the following URL into your browser:<br>
      <a href="${resetUrl}">${resetUrl}</a>
    </div>

    <!-- Footer / Support -->
    <div class="support">
      If you did not request this password reset, please ignore this email or contact support immediately.<br>
      Need help? Contact us at <a href="mailto:chandansinghrkt123@gmail.com">chandansinghrkt123@gmail.com</a>.
    </div>
  </div>
</body>
</html>`;
};
