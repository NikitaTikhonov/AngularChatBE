const express = require('express');
const router = express.Router();

const postController = require('../controllers/post');
const authHelper = require('../helpers/authHelper');

router.post('/post/add-post', authHelper.verifyToken, postController.addPost);

module.exports = router;
