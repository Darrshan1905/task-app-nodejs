const express = require('express');
const router = express.Router();
const validateToken = require('../middleware/validateTokenHandler');

const {signupUser, loginUser, updateUser, currUser} = require('../controllers/usersController')

router.route('/signup').post(signupUser)

router.route('/login').post(loginUser)

router.get('/profile', validateToken, currUser)

router.put('/update',validateToken, updateUser)

module.exports = router;