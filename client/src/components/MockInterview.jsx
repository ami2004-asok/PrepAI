import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Award, Sparkles, RefreshCw, ChevronRight, HelpCircle, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateQuestions, evaluateAnswer } from '../services/api';

const MockInterview = ({ analysis, onInterviewComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [interviewId, setInterviewId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [evaluationsHistory, setEvaluationsHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const handleStartInterview = async () => {
    if (!analysis || !analysis.jobDescription) {
      setError('No Job Description available. Please complete Step 1 first.');
      return;
    }

    setIsGenerating(true);
    setError('');
    try {
      const res = await generateQuestions({
        userId: analysis.userId,
        resumeAnalysisId: analysis._id,
        jobDescription: analysis.jobDescription,
        missingSkills: analysis.missingSkills || []
      });

      if (res.success && res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
        setInterviewId(res.interviewId);
        setCurrentIndex(0);
        setEvaluation(null);
        setEvaluationsHistory([]);
        setIsCompleted(false);
      } else {
        setError('Failed to generate interview questions.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error communicating with AI service.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      setError('Please type your answer before submitting.');
      return;
    }

    setIsEvaluating(true);
    setError('');
    const currentQ = questions[currentIndex];

    try {
      const res = await evaluateAnswer({
        interviewId,
        question: currentQ.question,
        userAnswer: userAnswer.trim()
      });

      if (res.success) {
        setEvaluation(res.evaluation);
        setEvaluationsHistory((prev) => [...prev, { question: currentQ, answer: userAnswer, evaluation: res.evaluation }]);
      } else {
        setError(res.message || 'Failed to evaluate answer.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error evaluating answer with AI.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer('');
      setEvaluation(null);
    } else {
      setIsCompleted(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (onInterviewComplete) onInterviewComplete();
    }
  };

  const currentQ = questions[currentIndex];

  const calculateOverallScore = () => {
    if (evaluationsHistory.length === 0) return 0;
    const total = evaluationsHistory.reduce((acc, item) => acc + (item.evaluation.score || 0), 0);
    return (total / evaluationsHistory.length).toFixed(1);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '32px auto', padding: '0 16px' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>
          <MessageSquare size={14} /> Step 3 of 4: Interactive AI Mock Interview
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          Real-Time Technical & Behavioral <span className="gradient-text">Interview Practice</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '640px', margin: '8px auto 0 auto' }}>
          Practice answering targeted interview questions generated specifically for your role gaps. Receive instant AI grading, feedback, and ideal answers.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px',
          padding: '14px 18px',
          color: '#fb7185',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.92rem' }}>{error}</span>
        </div>
      )}

      {/* State 1: Initial Launch Screen */}
      {questions.length === 0 && !isCompleted && (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <Sparkles size={32} color="#818cf8" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Ready for your AI Mock Interview?</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 24px auto', fontSize: '0.95rem' }}>
            We will generate 10 customized questions (Technical, Behavioral, HR) focusing heavily on your target Job Description and detected skill gaps.
          </p>
          <button
            onClick={handleStartInterview}
            disabled={isGenerating}
            className="btn-primary"
            style={{ padding: '14px 32px', fontSize: '1.05rem' }}
          >
            {isGenerating ? <span className="spinner"></span> : <MessageSquare size={20} />}
            {isGenerating ? 'Generating Customized Questions...' : 'Generate Interview Questions & Start'}
          </button>
        </div>
      )}

      {/* State 2: Active Question & Answering */}
      {questions.length > 0 && !isCompleted && (
        <div>
          {/* Progress Tracker Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className={`badge ${
              currentQ.type === 'Technical' ? 'badge-indigo' : currentQ.type === 'Behavioral' ? 'badge-cyan' : 'badge-amber'
            }`}>
              {currentQ.type} Question
            </span>
          </div>

          <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Question Box */}
          <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', lineHeight: '1.5', color: '#ffffff', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <HelpCircle size={24} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
              {currentQ.question}
            </h3>
          </div>

          {/* Answer Input / Response Section */}
          <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
              Your Response:
            </label>
            <textarea
              className="form-textarea"
              rows={6}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={!!evaluation || isEvaluating}
              placeholder="Type your response here. Provide clear examples, technical details, or structured methodology (STAR method for behavioral questions)..."
            />

            {!evaluation && (
              <button
                onClick={handleEvaluate}
                disabled={isEvaluating || !userAnswer.trim()}
                className="btn-primary"
                style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}
              >
                {isEvaluating ? <span className="spinner"></span> : <Send size={18} />}
                {isEvaluating ? 'Evaluating with Gemini AI...' : 'Submit Response for AI Grading'}
              </button>
            )}
          </div>

          {/* Evaluation Feedback Panel */}
          {evaluation && (
            <div className="glass-panel animate-fade-in" style={{ padding: '28px', borderColor: 'rgba(16, 185, 129, 0.4)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: evaluation.score >= 7 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    border: `2px solid ${evaluation.score >= 7 ? '#10b981' : '#f59e0b'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: '#ffffff'
                  }}>
                    {evaluation.score}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Evaluation Score: {evaluation.score} / 10</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Confidence Level: <strong style={{ color: '#ffffff' }}>{evaluation.confidenceLevel || 'High'}</strong>
                    </span>
                  </div>
                </div>

                <button onClick={handleNextQuestion} className="btn-accent">
                  {currentIndex + 1 === questions.length ? 'Finish Interview' : 'Next Question'} <ChevronRight size={18} />
                </button>
              </div>

              {/* Strengths & Weaknesses */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <h5 style={{ color: '#34d399', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> Key Strengths
                  </h5>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    {evaluation.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <h5 style={{ color: '#fbbf24', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} /> Areas to Improve
                  </h5>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    {evaluation.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>

              {/* Ideal Answer */}
              {evaluation.idealAnswer && (
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <h5 style={{ color: '#818cf8', fontSize: '0.9rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={16} /> Recommended Ideal Answer
                  </h5>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                    {evaluation.idealAnswer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* State 3: Completed Screen */}
      {isCompleted && (
        <div className="glass-panel animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
          <Award size={56} color="#10b981" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Interview Session Completed!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '24px' }}>
            Congratulations! You completed all {questions.length} interview questions.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '16px 32px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '32px'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Overall Average Score</span>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399' }}>
                {calculateOverallScore()} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ 10</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button onClick={handleStartInterview} className="btn-secondary">
              <RefreshCw size={18} /> Practice Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
