const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SG_API_KEY);

const sendWelcomEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "david@aptenobytes.com",
    subject: "thanks for joining",
    text: `welcome to the app ${name}!`,
  });
};

const sendGoodbyEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "david@aptenobytes.com",
    subject: "soory to see you go!",
    text: `goodby from us, ${name}!`,
  });
};

module.exports = {
  sendWelcomEmail,
  sendGoodbyEmail,
};

// sgMail
//   .send({
//     to: "david@aptenobytes.com",
//     from: "david@aptenobytes.com",
//     subject: "first email using send grid",
//     text: "this is the first email i am sending to you from this email service",
//   })
//   .then(() => {
//     console.log("email sent");
//   });
