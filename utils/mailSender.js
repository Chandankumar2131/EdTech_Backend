const nodemailer = require('nodemailer');
require("dotenv").config();

const mailSender = async (email, title, body) => {
    try {

        let transport = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })

        let info = await transport.sendMail({
            from: 'Studynotion || codehelp - by Chandan',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        });

        
    console.log("Email sent: %s", info.messageId);
    return info;

    } catch (error) {
        console.log(error);

    }

}
module.exports = mailSender;