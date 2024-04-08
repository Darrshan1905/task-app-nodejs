const express = require('express');
const router = express.Router({mergeParams: true});

const {getComments, createComment, deleteComment} = require('../controllers/commentsController');
const validateToken = require('../middleware/validateTokenHandler');

router.get('/',getComments);
router.post('/new',validateToken,createComment);
router.delete("/:id", validateToken,deleteComment);

module.exports = router;