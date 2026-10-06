const twilio = require("twilio");
require("dotenv").config();

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

exports.sendOTP = async (countryCode, phone, otp) => {
    try {

        const fullNumber = `${countryCode}${phone}`;

        await client.messages.create({
            body: `Your OTP code is: ${otp}`,
            from: process.env.TWILIO_PHONE,
            to: fullNumber
        });

        return true;

    } catch (err) {

        console.log(err.message);
        return false;

    }
};