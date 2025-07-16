const router = require('express').Router();
const authController = require('../controllers/authController');
const {
  validateLogin,
  validateAddWriter,
} = require('../middlewares/authValidation');
const { auth, role } = require('../middlewares/middleware');

// Puplic Login route
router.post('/api/login', validateLogin, authController.login);

// Admin-only routes
router.post(
  '/api/news/writers',
  auth,
  role,
  validateAddWriter,
  authController.addWriter
);

router.get('/api/news/writers', auth, role, authController.getWriters);

module.exports = router;
