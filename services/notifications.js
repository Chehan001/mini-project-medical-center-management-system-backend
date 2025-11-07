import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendSms(to, body) {
  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_FROM,
      to,
      body,
    });
    console.log("SMS sent:", message.sid);
    return message;
  } catch (err) {
    console.error("Twilio SMS error:", err);
    throw err;
  }
}
