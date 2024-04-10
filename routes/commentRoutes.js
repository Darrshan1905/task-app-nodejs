const express = require('express');
const router = express.Router({mergeParams: true});

const {getComments, createComment, deleteComment} = require('../controllers/commentsController');
const validateToken = require('../middleware/validateTokenHandler');

router.use(validateToken);

router.get('/',getComments);
router.post('/new',createComment);
router.delete("/:id(\\d+)",deleteComment);

module.exports = router;