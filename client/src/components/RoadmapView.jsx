import React, { useState } from 'react';
import { Compass, BookOpen, CheckSquare, Layers, ExternalLink, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { generateRoadmap } from '../services/api';

const RoadmapView = ({ missingSkills = [], analysisId, userId, existingRoadmap }) => {
  const [roadmapData, setRoadmapData] = useState(existingRoadmap || null);
  const [skillsInput, setSkillsInput] = useState(missingSkills.join(', '));
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    const skillsList = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (skillsList.length === 0) {
      setError('Please provide at least one skill gap or topic to build a roadmap.');
      return;
    }

    setIsGenerating(true);
    setError('');
    try {
      const res = await generateRoadmap({
        userId,
        resumeAnalysisId: analysisId,
        missingSkills: skillsList
      });

      if (res.success && res.roadmap) {
        setRoadmapData(res.roadmap);
      } else {
        setError(res.message || 'Failed to generate learning roadmap.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error communicating with AI roadmap generator.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '32px auto', padding: '0 16px' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="badge badge-amber" style={{ marginBottom: '8px' }}>
          <Compass size={14} /> Step 4 of 4: Personalized Career Guidance
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          30-Day Skill Gap <span className="gradient-text">Learning Roadmap</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '640px', margin: '8px auto 0 auto' }}>
          Turn your identified skill gaps into an actionable, 4-week structured curriculum complete with weekly topics, tasks, recommended learning resources, and mini-projects.
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

      {/* Inputs / Skills Bar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
          Target Missing Skills for 30-Day Curriculum:
        </label>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            style={{ flex: 1, minWidth: '260px' }}
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="e.g. Docker, System Design, GraphQL, Redis..."
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-accent"
            style={{ padding: '12px 24px' }}
          >
            {isGenerating ? <span className="spinner"></span> : <Sparkles size={18} />}
            {isGenerating ? 'Building Plan...' : 'Generate Roadmap'}
          </button>
        </div>
      </div>

      {/* Roadmap Weeks View */}
      {roadmapData && roadmapData.weeks && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {roadmapData.weeks.map((week, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '28px', borderLeft: '4px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-indigo" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                    {week.week}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                    {week.topics ? week.topics.join(' • ') : `Module ${idx + 1}`}
                  </h3>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {/* Topics & Tasks */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: '#818cf8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckSquare size={16} /> Key Study Tasks
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {week.tasks?.map((task, tidx) => (
                      <li key={tidx} style={{ fontSize: '0.88rem', color: 'var(--text-main)', padding: '6px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ color: '#10b981' }}>✓</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: '#67e8f9', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={16} /> Recommended Learning Resources
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {week.resources?.map((resItem, ridx) => (
                      <li key={ridx} style={{ fontSize: '0.88rem', color: 'var(--text-muted)', padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ExternalLink size={14} color="#67e8f9" />
                        <span>{resItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mini Projects */}
                {week.miniProjects && week.miniProjects.length > 0 && (
                  <div style={{ gridColumn: '1 / -1', background: 'rgba(99, 102, 241, 0.08)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <h4 style={{ fontSize: '0.92rem', color: '#a5b4fc', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={16} /> Recommended Hands-on Mini Project
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: 0 }}>
                      {week.miniProjects.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoadmapView;
