const Joi = require('@hapi/joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const Helpers = require('../helpers/helpers');
const { secret } = require('../config/secret');

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
        .regex(/^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,}$/)
        .required()
        .error(errors => {
          return {
            message:
              'Password must contain at least one letter, at least one number,and be longer than 6 characters'
          };
        })
    });

    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
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
      const userData = (({ username, _id }) => ({ username, _id }))(user);
      const token = jwt.sign(userData, secret, {
        expiresIn: '1h'
      });
      res.cookie('auth', token);
      res
        .status(HttpStatus.CREATED)
        .json({ message: 'User created successfully', user: userData, token });
    } catch (err) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occurred' });
    }
  },

  async loginUser(req, res) {
    const schema = Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required()
    });

    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
    }

    try {
      const user = await User.findOne({
        username: Helpers.firstUpper(value.username)
      }).select('-__v');
      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Invalid credentials' });
      }

      bcrypt.compare(value.password, user.password).then(result => {
        if (!result)
          return res
            .status(HttpStatus.NOT_FOUND)
            .json({ message: 'Invalid credentials' });
        const userData = (({ username, _id }) => ({ username, _id }))(user);
        const token = jwt.sign(userData, secret, {
          expiresIn: '1h'
        });
        res.cookie('auth', token);
        return res
          .status(HttpStatus.OK)
          .json({ message: 'Login successful', user: userData, token });
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occurred' });
    }
  }
};
