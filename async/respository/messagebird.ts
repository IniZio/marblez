import initMB, { MessageParameters } from 'messagebird';
const messagebird = initMB(process.env.MESSAGEBIRD_API_KEY);

export const sendSMS = (smsParams: Pick<MessageParameters, 'recipients' | 'body'>) =>
  new Promise((resolve, reject) => {
    messagebird.messages.create({
      originator : '85255429880',
      recipients : [ '<YOUR-MOBILE-NUMBER>' ],
      body : 'Hi! This is your first message'
    },
    function (err, response) {
        if (err) {
        console.log("ERROR:");
        console.log(err);
    } else {
        console.log("SUCCESS:");
        console.log(response);
            }
    });
  })
