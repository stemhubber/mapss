// MessageService.js
const twilio = require('twilio');

class MessageService {
  constructor(accountSid, authToken, senderNumber) {
    this.client = twilio(accountSid, authToken);
    this.senderNumber = senderNumber;
  }

  async sendSms(to, body) {
    try {
      const message = await this.client.messages.create({
        body,
        from: this.senderNumber,
        to,
      });

      console.log(`✅ Message sent: SID ${message.sid}`);
      return message;
    } catch (error) {
      console.error(`❌ Failed to send SMS: ${error.message}`);
      throw error;
    }
  }
}

module.exports = MessageService;
