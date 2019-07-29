const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const auth = require('./routes/authRoutes');

const app = express();

mongoose.connect(require('./config/secret').url, {
  useNewUrlParser: true
}).then(()=>console.log('DB connected')).catch(err=>console.log(err));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(logger('dev'));

app.use('/api/chatapp', auth);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
