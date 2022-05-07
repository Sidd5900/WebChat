const moment = require('moment');

//take user and his message and convert into a json object with current time
function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;