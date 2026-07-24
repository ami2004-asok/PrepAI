const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// We use the recommended model
const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

/**
 * Utility to parse Gemini JSON responses safely.
 * Gemini sometimes wraps JSON in markdown blocks like ```json ... ```
 */
const parseGeminiResponse = (text) => {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7, cleanText.length - 3).trim();
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3, cleanText.length - 3).trim();
    }
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Failed to parse Gemini JSON:', text);
    throw new Error('Invalid JSON response from AI');
  }
};

/**
 * 1. Resume Analyzer
 */
const analyzeResume = async (resumeText, jobDescription) => {
  const prompt = `
    You are an expert ATS (Applicant Tracking System) and technical recruiter.
    I will provide you with a Resume Text and a Job Description.
    
    Resume Text:
    ${resumeText}

    Job Description:
    ${jobDescription}

    Analyze the resume against the job description. Provide the output strictly in the following JSON format, without any markdown formatting or extra text:
    {
      "resumeScore": (number 0-100),
      "atsScore": (number 0-100),
      "matchingSkills": ["skill1", "skill2"],
      "missingSkills": ["skill1", "skill2"],
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "suggestions": ["suggestion1", "suggestion2"]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return parseGeminiResponse(responseText);
  } catch (error) {
    console.error('Gemini analyzeResume Error:', error);
    throw new Error('Failed to analyze resume with AI');
  }
};

/**
 * 2. Interview Question Generator
 */
const generateQuestions = async (jobDescription, missingSkills) => {
  const prompt = `
    You are an expert technical interviewer. 
    Based on the following Job Description and the candidate's Missing Skills, generate interview questions.
    
    Job Description:
    ${jobDescription}

    Candidate's Missing Skills:
    ${missingSkills.join(', ')}

    Please generate exactly:
    - 5 Technical Questions (focusing heavily on the job description and missing skills to test their knowledge gaps)
    - 3 Behavioral Questions
    - 2 HR Questions

    Return ONLY a JSON array of objects in this exact format:
    [
      { "question": "The question text?", "type": "Technical" },
      { "question": "The question text?", "type": "Behavioral" },
      { "question": "The question text?", "type": "HR" }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return parseGeminiResponse(responseText);
  } catch (error) {
    console.error('Gemini generateQuestions Error:', error);
    throw new Error('Failed to generate questions with AI');
  }
};

/**
 * 3. AI Answer Evaluator
 */
const evaluateAnswer = async (question, userAnswer) => {
  const prompt = `
    You are an expert technical interviewer evaluating a candidate's answer.
    
    Question asked: ${question}
    Candidate's Answer: ${userAnswer}

    Evaluate the answer and provide constructive feedback.
    Return ONLY a JSON object in this exact format:
    {
      "score": (number 1-10),
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "idealAnswer": "A comprehensive, ideal answer to the question",
      "confidenceLevel": "Low/Medium/High (based on the answer's tone and completeness)"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return parseGeminiResponse(responseText);
  } catch (error) {
    console.error('Gemini evaluateAnswer Error:', error);
    throw new Error('Failed to evaluate answer with AI');
  }
};

/**
 * 4. Learning Roadmap Generator
 */
const generateRoadmap = async (missingSkills) => {
  const prompt = `
    You are a technical career coach. Create a 30-day learning roadmap to help a candidate master these missing skills: ${missingSkills.join(', ')}.
    Break it down into 4 weeks.
    
    Return ONLY a JSON array representing the weeks, exactly in this format:
    [
      {
        "week": "Week 1",
        "topics": ["topic1", "topic2"],
        "resources": ["Resource Name - URL", "Resource Name - URL"],
        "tasks": ["Task 1", "Task 2"],
        "miniProjects": ["Mini Project 1"]
      },
      ... and so on for Week 2, Week 3, Week 4
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return parseGeminiResponse(responseText);
  } catch (error) {
    console.error('Gemini generateRoadmap Error:', error);
    throw new Error('Failed to generate roadmap with AI');
  }
};

module.exports = {
  analyzeResume,
  generateQuestions,
  evaluateAnswer,
  generateRoadmap
};
