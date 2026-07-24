import React from 'react';
import { Award, CheckCircle, AlertTriangle, Lightbulb, MessageSquare, Compass, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const ScoreRing = ({ score, title, color }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="score-circle">
        <svg width="124" height="124">
          <circle
            cx="62"
            cy="62"
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="62"
            cy="62"
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <span className="score-number">{score}%</span>
      </div>
      <h4 style={{ marginTop: '16px', fontSize: '1rem', color: 'var(--text-main)' }}>{title}</h4>
    </div>
  );
};

const AnalysisDashboard = ({ analysis, onStartInterview, onGenerateRoadmap }) => {
  if (!analysis) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>No Analysis Results Yet</h2>
        <p style={{ marginTop: '8px', color: 'var(--text-subtle)' }}>Please upload your resume and job description to generate an ATS audit.</p>
      </div>
    );
  }

  const {
    resumeScore = 0,
    atsScore = 0,
    matchingSkills = [],
    missingSkills = [],
    strengths = [],
    weaknesses = [],
    suggestions = []
  } = analysis;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '32px auto', padding: '0 16px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>
            <ShieldCheck size={14} /> Step 2 of 4: ATS Resume Audit Complete
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            Resume & Skill Gap <span className="gradient-text">Analysis Report</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => onStartInterview(analysis)} 
            className="btn-primary"
          >
            <MessageSquare size={18} /> Start Mock AI Interview <ArrowRight size={16} />
          </button>
          <button 
            onClick={() => onGenerateRoadmap(missingSkills, analysis._id)} 
            className="btn-accent"
          >
            <Compass size={18} /> Generate 30-Day Roadmap
          </button>
        </div>
      </div>

      {/* Scores Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <ScoreRing score={resumeScore} title="Overall Skill Match" color="#6366f1" />
        <ScoreRing score={atsScore} title="ATS System Compatibility" color="#10b981" />
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Skill Gap Summary
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '12px 0 6px 0' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399' }}>{matchingSkills.length}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Matching</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fb7185', marginLeft: '12px' }}>{missingSkills.length}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Missing</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Target missing skills in your interview practice and learning roadmap below.
          </p>
        </div>
      </div>

      {/* Skills Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Matching Skills */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CheckCircle size={20} color="#34d399" />
            <h3 style={{ fontSize: '1.15rem' }}>Matching Skills ({matchingSkills.length})</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {matchingSkills.map((skill, i) => (
              <span key={i} className="badge badge-emerald">
                ✓ {skill}
              </span>
            ))}
            {matchingSkills.length === 0 && (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-subtle)' }}>No exact skill matches found.</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={20} color="#fb7185" />
            <h3 style={{ fontSize: '1.15rem' }}>Missing Skills / Skill Gaps ({missingSkills.length})</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {missingSkills.map((skill, i) => (
              <span key={i} className="badge badge-rose">
                ⚠ {skill}
              </span>
            ))}
            {missingSkills.length === 0 && (
              <p style={{ fontSize: '0.88rem', color: '#34d399' }}>Great job! No major missing skills flagged.</p>
            )}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Strengths */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#818cf8" /> Key Strengths
          </h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {strengths.map((item, idx) => (
              <li key={idx} style={{ fontSize: '0.92rem', color: 'var(--text-main)', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#818cf8', fontWeight: 'bold' }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses / Improvements */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="#fbbf24" /> Areas for Improvement
          </h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {weaknesses.map((item, idx) => (
              <li key={idx} style={{ fontSize: '0.92rem', color: 'var(--text-main)', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggestions */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lightbulb size={20} color="#67e8f9" /> Resume Optimization Recommendations
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {suggestions.map((item, idx) => (
            <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.9rem' }}>
              <span className="gradient-text-cyan" style={{ fontWeight: 700, marginRight: '6px' }}>Tip #{idx + 1}:</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
