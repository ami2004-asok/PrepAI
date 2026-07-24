import React, { useState } from 'react';
import { Upload, FileText, Briefcase, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { uploadResume, analyzeResume } from '../services/api';

const sampleJDs = [
  {
    title: 'Senior Full Stack Engineer (React & Node.js)',
    text: 'Looking for a Senior Full Stack Engineer with 4+ years of experience building scalable web applications. Requirements: React, Node.js, Express, MongoDB/PostgreSQL, REST APIs, Docker, GraphQL, System Architecture, and AWS/Cloud deployments. Strong problem solving and CI/CD knowledge required.'
  },
  {
    title: 'Frontend Specialist (React / Next.js)',
    text: 'Seeking a passionate Frontend Developer skilled in React.js, Next.js, TypeScript, TailwindCSS, Web Vitals optimization, state management (Redux/Zustand), and Unit Testing (Jest/RTL). Experience with micro-frontends and UI design systems is a plus.'
  },
  {
    title: 'AI / Backend Engineer (Node & Python)',
    text: 'We are hiring an AI Integration Engineer to work on LLM agents, RAG pipelines, and high-performance REST APIs. Requirements: Node.js, Python, OpenAI/Gemini API integration, LangChain, Vector DBs (Chroma/Pinecone), MongoDB, and Async Queues.'
  }
];

const ResumeUpload = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
        setError('Please upload a valid PDF file.');
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleUploadPDF = async () => {
    if (!file) return;
    setIsUploading(true);
    setError('');
    try {
      const res = await uploadResume(file);
      if (res.success) {
        setExtractedText(res.text);
        setUserId(res.userId);
      } else {
        setError(res.message || 'Failed to extract text from PDF.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error processing PDF file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    const textToAnalyze = extractedText.trim();
    const jdText = jobDescription.trim();

    if (!textToAnalyze) {
      setError('Please upload and extract a PDF resume, or type your resume details.');
      return;
    }
    if (!jdText) {
      setError('Please enter a target Job Description.');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    try {
      const res = await analyzeResume({
        userId,
        resumeText: textToAnalyze,
        jobDescription: jdText
      });

      if (res.success) {
        onAnalysisComplete(res.analysis);
      } else {
        setError(res.message || 'Failed to analyze resume.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Error communicating with AI service.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '32px auto', padding: '0 16px' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="badge badge-indigo" style={{ marginBottom: '12px' }}>
          <Sparkles size={14} /> Step 1 of 4: Resume & Job Analysis
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px', marginBottom: '12px' }}>
          Optimize Your Resume & <span className="gradient-text">Identify Skill Gaps</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
          Upload your resume PDF and paste the target job description. Our Gemini AI will perform an ATS audit, flag missing skills, and prepare tailored mock interview questions.
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Left Card: PDF Upload & Text Extraction */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)' }}>
              <FileText size={20} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Upload Resume (PDF)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Extract resume text via backend Multer & pdf-parse</p>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div style={{
            border: '2px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '32px 20px',
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            <Upload size={36} color="#818cf8" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {file ? file.name : 'Click or Drag & Drop PDF Resume here'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Supported file format: PDF (Max size: 10MB)
            </p>
          </div>

          {file && !extractedText && (
            <button 
              onClick={handleUploadPDF} 
              disabled={isUploading}
              className="btn-secondary" 
              style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}
            >
              {isUploading ? <span className="spinner"></span> : <CheckCircle2 size={18} />}
              {isUploading ? 'Parsing PDF Text...' : 'Parse Resume PDF'}
            </button>
          )}

          {/* Extracted Text Area */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Resume Text Preview / Manual Input:
              </label>
              {extractedText && (
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                  <CheckCircle2 size={12} /> Extracted Successfully
                </span>
              )}
            </div>
            <textarea
              className="form-textarea"
              rows={8}
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Resume text will appear here automatically when PDF is uploaded, or you can paste your resume content directly..."
            />
          </div>
        </div>

        {/* Right Card: Job Description & Quick Templates */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)' }}>
              <Briefcase size={20} color="#c084fc" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Target Job Description</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paste the role requirements you are applying for</p>
            </div>
          </div>

          {/* Sample Templates */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'block', marginBottom: '6px' }}>
              Or quick-fill with sample roles:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {sampleJDs.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setJobDescription(sample.text)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.borderColor = '#818cf8'}
                  onMouseOut={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                >
                  + {sample.title}
                </button>
              ))}
            </div>
          </div>

          <textarea
            className="form-textarea"
            style={{ flex: 1, minHeight: '180px' }}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste Job Description here (e.g. key responsibilities, required technical skills, experience levels)..."
          />

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn-primary"
            style={{ width: '100%', marginTop: '20px', justifyContent: 'center', padding: '14px 28px', fontSize: '1.02rem' }}
          >
            {isAnalyzing ? <span className="spinner"></span> : <Sparkles size={20} />}
            {isAnalyzing ? 'Analyzing with Gemini AI...' : 'Analyze Resume & Detect Gaps'}
            {!isAnalyzing && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
