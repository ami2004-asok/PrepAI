import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await axios.post(`${API_BASE_URL}/uploadResume`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analyzeResume = async ({ userId, resumeText, jobDescription }) => {
  const response = await api.post('/analyzeResume', {
    userId,
    resumeText,
    jobDescription,
  });
  return response.data;
};

export const generateQuestions = async ({ userId, resumeAnalysisId, jobDescription, missingSkills }) => {
  const response = await api.post('/generateQuestions', {
    userId,
    resumeAnalysisId,
    jobDescription,
    missingSkills,
  });
  return response.data;
};

export const evaluateAnswer = async ({ interviewId, question, userAnswer }) => {
  const response = await api.post('/evaluateAnswer', {
    interviewId,
    question,
    userAnswer,
  });
  return response.data;
};

export const generateRoadmap = async ({ userId, resumeAnalysisId, missingSkills }) => {
  const response = await api.post('/generateRoadmap', {
    userId,
    resumeAnalysisId,
    missingSkills,
  });
  return response.data;
};

export const getDashboard = async (userId) => {
  const url = userId ? `/dashboard?userId=${userId}` : '/dashboard';
  const response = await api.get(url);
  return response.data;
};

export const getInterviewById = async (id) => {
  const response = await api.get(`/interview/${id}`);
  return response.data;
};

export const getAnalysisById = async (id) => {
  const response = await api.get(`/analysis/${id}`);
  return response.data;
};

export default api;
