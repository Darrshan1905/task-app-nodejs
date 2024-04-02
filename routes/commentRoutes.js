const express = require('express');
const router = express.Router({mergeParams: true});

const {getComments, createComment, deleteComment} = require('../controllers/commentsController');

router.route("/").get(getComments);
router.route("/new").post(createComment);
router.route("/:id").delete(deleteComment);

module.exports = router;