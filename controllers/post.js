module.exports = {
  addPost(req, res) {
    console.log(req.user);
    console.log(req.cookies);
    console.log(req.body);
  }
};
