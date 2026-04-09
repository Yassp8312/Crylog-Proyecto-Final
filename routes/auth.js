const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, optionalAuth } = require('../middlewares/auth');

router.get('/register', optionalAuth, authController.getRegister);
router.post('/register', optionalAuth, authController.postRegister);

router.get('/login', optionalAuth, authController.getLogin);
router.post('/login', optionalAuth, authController.postLogin);

router.get('/logout', authenticate, authController.logout);

router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;
