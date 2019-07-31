const Joi = require('@hapi/joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Post = require('../models/postModel');
const Helpers = require('../helpers/helpers');
const { secret } = require('../config/secret');

module.exports = {
  async addPost(req, res) {
    const schema = Joi.object().keys({
      post: Joi.string().required()
    });

    const { error, value } = Joi.validate(req.body, schema);
    if (error && error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details[0] });
    }

    const body = {
      user: req.user._id,
      username: req.user.username,
      post: req.body.post,
      created: new Date()
    };

    try {
      const post = await Post.create(body);
      return res
        .status(HttpStatus.CREATED)
        .json({ message: 'Post created', post });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error occurred' });
    }
  }
};
