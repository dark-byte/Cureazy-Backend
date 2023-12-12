const Twilio = require('twilio');

app.get("/user", auth, getUser)



sgMail.setApiKey('YOUR_SENDGRID_API_KEY');

const twilioClient = new Twilio('YOUR_TWILIO_ACCOUNT_SID', 'YOUR_TWILIO_AUTH_TOKEN');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

const otps = {};

app.post('/send-email-otp', async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  otps[email] = otp;

  const msg = {
    to: email,
    from: 'your@email.com',
    subject: 'Email Verification OTP',
    text: `Your OTP: ${otp}`,
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ message: 'Email OTP sent successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send email OTP.' });
  }
});

app.post('/send-sms-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  const otp = generateOTP();
  otps[phoneNumber] = otp;

  try {
    await twilioClient.messages.create({
      body: `Your OTP: ${otp}`,
      from: 'YOUR_TWILIO_PHONE_NUMBER',
      to: phoneNumber,
    });
    res.status(200).json({ message: 'SMS OTP sent successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send SMS OTP.' });
  }
});