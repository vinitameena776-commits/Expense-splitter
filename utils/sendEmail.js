const { Resend } = require('resend');

console.log('EMAIL SERVICE: Resend initialized');
console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  console.log('EMAIL SERVICE: Attempting to send email to:', options.email);

  const { data, error } = await resend.emails.send({
    from: 'Expense Splitter <onboarding@resend.dev>',
    to: [options.email],
    subject: options.subject,
    html: options.html
  });

  if (error) {
    console.error('RESEND ERROR:', error);
    throw new Error(error.message || 'Failed to send email');
  }

  console.log('EMAIL SERVICE: Email sent:', data);
  return data;
};

module.exports = sendEmail;