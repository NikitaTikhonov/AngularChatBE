const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const auth = require('./routes/authRoutes');

const app = express();

mongoose
  .connect(require('./config/secret').url, {
    useNewUrlParser: true
  })
  .then(() => console.log('DB connected'))
  .catch(err => console.log(err));

app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'DELETE', 'PUT');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(logger('dev'));

app.use('/api/chatapp', auth);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
