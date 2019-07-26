const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

mongoose.connect(require('./config/secret').url, {
  useNewUrlParser: true
});

app.use(cookieParser());
app.use(logger('dev'));

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
