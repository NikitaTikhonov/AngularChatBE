const Joi = require('@hapi/joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');

const User = require('../models/userModel');
const Helpers = require('../helpers/helpers');

module.exports = {
  async createUser(req, res) {
    const schema = Joi.object().keys({
      username: Joi.string()
        .min(5)
        .max(12)
        .required(),
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .regex(/^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,10}$/)
        .required()
    });

    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: error.details });
    }

    const userEmail = await User.findOne({
      email: Helpers.lowerCase(value.email)
    });

    if (userEmail) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ message: 'Email already exists' });
    }

    const userName = await User.findOne({
      username: Helpers.firstUpper(value.username)
    });

    if (userName) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ message: 'Username already exists' });
    }

    let hash;
    try {
      hash = await bcrypt.hash(value.password, 10);
    } catch (err) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Error hashing password' });
    }
    const body = {
      username: Helpers.firstUpper(value.username),
      email: Helpers.lowerCase(value.email),
      password: hash
    };

    try {
      const user = await User.create(body);
      res
        .status(HttpStatus.CREATED)
        .json({ message: 'User created successfully', user });
    } catch (err) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occurred' });
    }
  }
};
