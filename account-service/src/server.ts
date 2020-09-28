import App from './config/express';
import config = require('./config/env/index');

// start server
App.listen(config.PORT, () => {
  console.info(`server started on port: ${config.PORT} (${config.NODE_ENV})`);
  console.info(`CLIENT_URL: ${config.CLIENT_URL}`);
});

module.exports = App;
