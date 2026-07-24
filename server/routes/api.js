const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const apiController = require('../controllers/apiController');

// Define API Endpoints
router.post('/uploadResume', upload.single('resume'), apiController.uploadResume);
router.post('/analyzeResume', apiController.analyzeResume);
router.post('/generateQuestions', apiController.generateQuestions);
router.post('/evaluateAnswer', apiController.evaluateAnswer);
router.post('/generateRoadmap', apiController.generateRoadmap);
router.get('/dashboard', apiController.getDashboard);
router.get('/interview/:id', apiController.getInterviewById);
router.get('/analysis/:id', apiController.getAnalysisById);

module.exports = router;
