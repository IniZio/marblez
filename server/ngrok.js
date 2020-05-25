const ngrok = require('ngrok');

const { PORT = '4000' }   = process.env;

(async () => {
  const url = await ngrok.connect(parseInt(PORT));
  console.log('Tunneled to ', url);
})();
