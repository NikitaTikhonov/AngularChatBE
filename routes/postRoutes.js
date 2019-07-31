const express = require('express');
const router = express.Router();

const postController = require('../controllers/post');

router.post('/register/add-post', postController.addPost);

module.exports = router;
