const nodemailer = require('nodemailer')

const mailTransport = nodemailer.createTransport({
    
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_EMAIL_PASSWORD
    }
    
});

module.exports = mailTransport


