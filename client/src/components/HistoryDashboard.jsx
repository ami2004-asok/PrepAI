import React, { useState, useEffect } from 'react';
import { History, FileText, MessageSquare, Compass, Calendar, Star, RefreshCw, UserCheck } from 'lucide-react';
import { getDashboard } from '../services/api';

const HistoryDashboard = ({ activeUser, onSelectAnalysis, onSelectInterview, onSelectRoadmap }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getDashboard(activeUser?._id);
      if (res.success && res.data) {
        setDashboardData(res.data);
      } else {
        setError('Failed to fetch user history.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not load history records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeUser]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto', width: '32px', height: '32px' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading Candidate Activity History...</p>
      </div>
    );
  }

  const { analysis, interviews = [], roadmap, user } = dashboardData || {};

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '32px auto', padding: '0 16px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>
            <History size={14} /> Candidate History & Records
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            Activity <span className="gradient-text">Dashboard</span>
          </h1>
        </div>
        <button onClick={fetchHistory} className="btn-secondary">
          <RefreshCw size={16} /> Refresh Records
        </button>
      </div>

      {/* User Info Bar */}
      {user && (
        <div className="glass-panel" style={{ padding: '20px 28px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserCheck size={24} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{user.name || 'Candidate User'}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>{user.email}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Latest Analysis Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <FileText size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.15rem' }}>Latest Resume Audit</h3>
          </div>
          {analysis ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Match Score:</span>
                <strong style={{ color: '#34d399' }}>{analysis.resumeScore}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ATS Score:</span>
                <strong style={{ color: '#818cf8' }}>{analysis.atsScore}%</strong>
              </div>
              <button onClick={() => onSelectAnalysis(analysis)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                View Analysis Details
              </button>
            </div>
          ) : (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-subtle)' }}>No resume analysis saved yet.</p>
          )}
        </div>

        {/* Interviews List Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <MessageSquare size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.15rem' }}>Mock Interview Sessions ({interviews.length})</h3>
          </div>
          {interviews.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
              {interviews.map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Session #{interviews.length - idx}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      Status: {item.status} • {item.questions?.length || 0} Questions
                    </div>
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                    <Star size={10} /> {item.averageScore || 0} / 10
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-subtle)' }}>No interview sessions conducted yet.</p>
          )}
        </div>

        {/* Saved Roadmap Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Compass size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.15rem' }}>Saved Learning Roadmap</h3>
          </div>
          {roadmap ? (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                4-Week Curriculum targeting: <strong style={{ color: '#ffffff' }}>{roadmap.missingSkills?.join(', ')}</strong>
              </p>
              <button onClick={() => onSelectRoadmap(roadmap)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                View 30-Day Roadmap
              </button>
            </div>
          ) : (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-subtle)' }}>No active roadmap generated yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryDashboard;
