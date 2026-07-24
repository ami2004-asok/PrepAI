import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ResumeUpload from './components/ResumeUpload';
import AnalysisDashboard from './components/AnalysisDashboard';
import MockInterview from './components/MockInterview';
import RoadmapView from './components/RoadmapView';
import HistoryDashboard from './components/HistoryDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [missingSkillsForRoadmap, setMissingSkillsForRoadmap] = useState([]);
  const [analysisIdForRoadmap, setAnalysisIdForRoadmap] = useState(null);

  const handleAnalysisComplete = (analysisData) => {
    setCurrentAnalysis(analysisData);
    if (analysisData.missingSkills) {
      setMissingSkillsForRoadmap(analysisData.missingSkills);
    }
    setAnalysisIdForRoadmap(analysisData._id);
    setActiveTab('analysis');
  };

  const handleStartInterview = (analysisData) => {
    setCurrentAnalysis(analysisData);
    setActiveTab('interview');
  };

  const handleGenerateRoadmapFromAnalysis = (missingSkills, analysisId) => {
    setMissingSkillsForRoadmap(missingSkills || []);
    setAnalysisIdForRoadmap(analysisId);
    setActiveTab('roadmap');
  };

  const handleSelectAnalysis = (analysisData) => {
    setCurrentAnalysis(analysisData);
    setActiveTab('analysis');
  };

  const handleSelectRoadmap = (roadmapData) => {
    setCurrentRoadmap(roadmapData);
    setActiveTab('roadmap');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeUser={currentAnalysis ? { _id: currentAnalysis.userId } : null}
      />

      <main style={{ flex: 1, paddingBottom: '60px' }}>
        {activeTab === 'upload' && (
          <ResumeUpload onAnalysisComplete={handleAnalysisComplete} />
        )}

        {activeTab === 'analysis' && (
          <AnalysisDashboard
            analysis={currentAnalysis}
            onStartInterview={handleStartInterview}
            onGenerateRoadmap={handleGenerateRoadmapFromAnalysis}
          />
        )}

        {activeTab === 'interview' && (
          <MockInterview
            analysis={currentAnalysis}
            onInterviewComplete={() => console.log('Interview Completed!')}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapView
            missingSkills={missingSkillsForRoadmap}
            analysisId={analysisIdForRoadmap}
            userId={currentAnalysis ? currentAnalysis.userId : null}
            existingRoadmap={currentRoadmap}
          />
        )}

        {activeTab === 'history' && (
          <HistoryDashboard
            activeUser={currentAnalysis ? { _id: currentAnalysis.userId } : null}
            onSelectAnalysis={handleSelectAnalysis}
            onSelectRoadmap={handleSelectRoadmap}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        color: 'var(--text-subtle)',
        fontSize: '0.85rem'
      }}>
        PrepAI – AI Resume, Interview & Career Coach • Built with React, Express, MongoDB & Google Gemini AI
      </footer>
    </div>
  );
}

export default App;
