const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    static createTransporter() {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    static async sendOTPEmail(email, name, otp) {
        try {
            const transporter = this.createTransporter();

            const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                    <style>
                        body { font-family: roboto !important; }
                        .container { width: 100%; text-align: center; margin: 0px auto; }
                        .wrapper { width: 550px; height: auto; margin: 10px auto; }
                        .header { padding: 2px 2px 8px 2px; background: #042954; text-align: center; }
                        .header-title { font-size: 20px; line-height: 40px; padding: 0; margin-top: 5px; text-align: center; color: #fff; }
                        .body-content { background: whitesmoke; padding: 15px 0; font-family: sans-serif; }
                        .otp-title { text-align: left; padding-left: 100px; font-size: 18px; margin-top: 0px; margin-bottom: 10px; color: #2dbba4; }
                        .footer { background: #042954; padding: 20px 5px 25px 5px; }
                        .footer-text { font-size: 13px; line-height: 7px; padding: 0; margin-top: 0px; text-align: center; color: #fff; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="wrapper">
                            <div class="header">
                                <div class="header-title">${process.env.APP_NAME}</div>
                            </div>
                            <div class="body-content">
                                <h3 class="otp-title">OTP</h3>
                                <center>
                                    <p>Dear ${name}.</p>
                                    <p>Your OTP is: ${otp}.</p>
                                </center>
                            </div>
                            <footer>
                                <div class="footer">
                                    <div style="width:100%; text-align:center;">
                                        <div class="footer-text">© ${process.env.APP_NAME} ${new Date().getFullYear()}. All Rights Reserved.</div>
                                    </div>
                                </div>
                            </footer>
                        </div>
                    </div>
                </body>
            </html>
            `;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'OTP Verification',
                html: htmlContent
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email Error:', error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = EmailService;