const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const User = require('../models/User');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Interview = require('../models/Interview');
const Roadmap = require('../models/Roadmap');
const geminiService = require('../services/geminiService');

/**
 * 1. Upload & Parse Resume PDF
 */
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume PDF file uploaded' });
    }

    let parsedText = '';
    let parser = null;
    try {
      const dataBuffer = fs.readFileSync(req.file.path);
      parser = new PDFParse({ data: dataBuffer });
      const data = await parser.getText();
      parsedText = data.text ? data.text.trim() : '';
    } finally {
      if (parser) {
        try {
          await parser.destroy();
        } catch (destroyError) {
          console.warn('Failed to destroy PDF parser cleanly:', destroyError.message);
        }
      }

      // Clean up uploaded temp file from disk
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    if (!parsedText) {
      return res.status(400).json({ success: false, message: 'Could not extract text from the provided PDF file' });
    }

    // Ensure a default user exists for MVP/guest testing
    let user = await User.findOne();
    if (!user) {
      user = await User.create({ name: 'Guest User', email: `guest_${Date.now()}@example.com` });
    }

    res.status(200).json({
      success: true,
      text: parsedText,
      userId: user._id,
      user
    });
  } catch (error) {
    console.error('uploadResume Controller Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to process resume PDF' });
  }
};

/**
 * 2. Analyze Resume against Job Description
 */
exports.analyzeResume = async (req, res) => {
  try {
    const { userId, resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Both resume text and job description are required'
      });
    }

    // Resolve or find User
    let targetUserId = userId;
    if (!targetUserId) {
      const user = await User.findOne();
      targetUserId = user ? user._id : (await User.create({ name: 'Guest User', email: `guest_${Date.now()}@example.com` }))._id;
    }

    // Call Gemini Service
    const analysisResult = await geminiService.analyzeResume(resumeText, jobDescription);

    // Save result to MongoDB
    const analysis = await ResumeAnalysis.create({
      userId: targetUserId,
      jobDescription,
      ...analysisResult
    });

    res.status(200).json({ success: true, analysis });
  } catch (error) {
    console.error('analyzeResume Controller Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to analyze resume' });
  }
};

/**
 * 3. Generate Interview Questions
 */
exports.generateQuestions = async (req, res) => {
  try {
    const { userId, resumeAnalysisId, jobDescription, missingSkills = [] } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ success: false, message: 'Job description is required' });
    }

    // Resolve user
    let targetUserId = userId;
    if (!targetUserId) {
      const user = await User.findOne();
      targetUserId = user ? user._id : (await User.create({ name: 'Guest User', email: `guest_${Date.now()}@example.com` }))._id;
    }

    // Generate questions with Gemini
    const questionsList = await geminiService.generateQuestions(jobDescription, missingSkills);

    // Store new interview session in DB
    const interview = await Interview.create({
      userId: targetUserId,
      resumeAnalysisId: resumeAnalysisId || null,
      questions: questionsList,
      answers: [],
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      interviewId: interview._id,
      questions: questionsList,
      interview
    });
  } catch (error) {
    console.error('generateQuestions Controller Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate questions' });
  }
};

/**
 * 4. Evaluate Candidate Answer
 */
exports.evaluateAnswer = async (req, res) => {
  try {
    const { interviewId, question, userAnswer } = req.body;

    if (!interviewId || !question || !userAnswer) {
      return res.status(400).json({
        success: false,
        message: 'interviewId, question, and userAnswer are all required'
      });
    }

    // Get evaluation from Gemini
    const evaluation = await geminiService.evaluateAnswer(question, userAnswer);

    // Fetch interview document from DB
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    // Add candidate answer & evaluation
    interview.answers.push({
      question,
      userAnswer,
      ...evaluation
    });

    // Update average score
    const totalScore = interview.answers.reduce((acc, curr) => acc + (curr.score || 0), 0);
    interview.averageScore = parseFloat((totalScore / interview.answers.length).toFixed(2));

    // Update session status
    if (interview.answers.length >= interview.questions.length && interview.questions.length > 0) {
      interview.status = 'completed';
    } else {
      interview.status = 'in-progress';
    }

    await interview.save();

    res.status(200).json({
      success: true,
      evaluation,
      interview
    });
  } catch (error) {
    console.error('evaluateAnswer Controller Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to evaluate answer' });
  }
};

/**
 * 5. Generate Learning Roadmap
 */
exports.generateRoadmap = async (req, res) => {
  try {
    const { userId, resumeAnalysisId, missingSkills } = req.body;

    if (!missingSkills || !Array.isArray(missingSkills) || missingSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'missingSkills array with at least one skill is required'
      });
    }

    // Resolve user
    let targetUserId = userId;
    if (!targetUserId) {
      const user = await User.findOne();
      targetUserId = user ? user._id : (await User.create({ name: 'Guest User', email: `guest_${Date.now()}@example.com` }))._id;
    }

    // Generate 4-week roadmap using Gemini
    const roadmapWeeks = await geminiService.generateRoadmap(missingSkills);

    // Save to DB
    const roadmap = await Roadmap.create({
      userId: targetUserId,
      resumeAnalysisId: resumeAnalysisId || null,
      missingSkills,
      weeks: roadmapWeeks
    });

    res.status(200).json({ success: true, roadmap });
  } catch (error) {
    console.error('generateRoadmap Controller Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate roadmap' });
  }
};

/**
 * 6. Get Dashboard Data
 */
exports.getDashboard = async (req, res) => {
  try {
    const userIdQuery = req.query.userId;
    let user;

    if (userIdQuery) {
      user = await User.findById(userIdQuery);
    } else {
      user = await User.findOne();
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const latestAnalysis = await ResumeAnalysis.findOne({ userId: user._id }).sort({ createdAt: -1 });
    const interviews = await Interview.find({ userId: user._id }).sort({ createdAt: -1 });
    const latestRoadmap = await Roadmap.findOne({ userId: user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        user,
        analysis: latestAnalysis,
        interviews,
        roadmap: latestRoadmap
      }
    });
  } catch (error) {
    console.error('getDashboard Controller Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch dashboard data' });
  }
};

/**
 * 7. Get Interview by ID
 */
exports.getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    res.status(200).json({ success: true, interview });
  } catch (error) {
    console.error('getInterviewById Controller Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch interview' });
  }
};

/**
 * 8. Get Resume Analysis by ID
 */
exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }
    res.status(200).json({ success: true, analysis });
  } catch (error) {
    console.error('getAnalysisById Controller Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch analysis' });
  }
};

