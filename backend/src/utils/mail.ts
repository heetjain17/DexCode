import { createTransport } from 'nodemailer';
import Mailgen, { Content } from 'mailgen';
import { ApiError } from './ApiError';
import dotenv from 'dotenv';
dotenv.config();

interface sendMailOptions {
  email: string;
  subject: string;
  mailGenContent: Content;
}

export const sendMail = async (options: sendMailOptions) => {
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Dexter Morgan',
      link: 'https://mailgen.js/',
    },
  });

  const emailHTML = mailGenerator.generate(options.mailGenContent);
  const emailText = mailGenerator.generatePlaintext(options.mailGenContent);

  const transporter = createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mail = {
    from: 'DexCode.Admin@gmail.com', // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: emailText, // plain text body
    html: emailHTML, // html body
  };

  try {
    await transporter.sendMail(mail);
    // console.log('Mail sent');
  } catch (error) {
    console.error('Mail error:', error);
    throw new ApiError(500, 'Failed to send email. Please try again later.');
  }
};

export const emailVerificationContent = (username: string, verificationUrl: string) => {
  return {
    body: {
      name: username,
      intro: "Welcome to DexCode! We're very excited to have you on board.",
      action: {
        instructions: 'To get started with our DexCode, please click here:',
        button: {
          color: '#22BC66',
          text: 'Verify your Email',
          link: verificationUrl,
        },
      },
    },
    outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
  };
};

export const forgotPasswordContent = (username: string, resetPasswordUrl: string) => {
  return {
    body: {
      name: username,
      intro: 'We got a request to change your password.',
      action: {
        instructions: 'To change the password click the button given below',
        button: {
          color: '#ff0000',
          text: 'reset password',
          link: resetPasswordUrl,
        },
      },
    },
    outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
  };
};
