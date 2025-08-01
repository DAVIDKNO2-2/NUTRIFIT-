const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');

router.get('/bodyparts', exerciseController.getBodyParts);
router.get('/exercises', exerciseController.getExercises);

module.exports = router;
