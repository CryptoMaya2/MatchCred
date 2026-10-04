import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight, 
  FileText, 
  Check, 
  Play, 
  Square,
  ChevronRight,
  Info
} from 'lucide-react';
import { evaluateRequirements, SAMPLE_DATASETS } from '../services/requirementMatcher';
import { extractStructuredCvData } from '../services/cvExtractor';
import './alexa.css';

export default function SimulatedAlexaScreen({
  credentials = [],
  setCredentials,
  cvData = null,
  setCvData,
  requirementsText = '',
  setRequirementsText,
  opportunityTitle = '',
  setOpportunityTitle,
  _report = null,
  setReport,
  onOpenMatchCred,
  onBackToMain
}) {
  // Input question state
  const [userInput, setUserInput] = useState('Alexa, do I qualify for this fellowship?');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Manual input tabs when missing
  const [missingInputTab, setMissingInputTab] = useState('upload'); // 'upload' | 'manual'
  const [manualCredName, setManualCredName] = useState('');
  const [manualCredIssuer, setManualCredIssuer] = useState('');
  const [manualCredYear, setManualCredYear] = useState('2024');
  const [customReqs, setCustomReqs] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [pastedCvText, setPastedCvText] = useState('');

  // Conversational response state
  const [conversationHistory, setConversationHistory] = useState([
    {
      role: 'alexa',
      type: 'greeting',
      text: 'Hello. I can evaluate your eligibility for fellowships, scholarships, or jobs using MatchCred. Try tapping “Alexa, do I qualify for this fellowship?” or load the sample fellowship.',
      timestamp: new Date()
    }
  ]);

  const [activeResult, setActiveResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const speechUtteranceRef = useRef(null);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const hasCredentials = (credentials && credentials.length > 0) || Boolean(cvData);
  const hasRequirements = Boolean(requirementsText && requirementsText.trim().length > 0);

  // Speak text helper with natural voice selection
  const speakText = (text) => {
    if (voiceMuted || !speechSupported || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.02;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      // Look for natural sounding english voices
      const preferredVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Jenny'))
      ) || voices.find(v => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis notice:', e);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Browser speech recognition (Speech-to-Text)
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition isn't supported in your current browser. You can type or tap the quick prompt!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        handleAsk(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  // Wire "Try the example" button to the sample fellowship
  const handleLoadSampleFellowship = (autoEvaluate = true) => {
    const dataset = SAMPLE_DATASETS.fellowship;
    if (!dataset) return;

    setCredentials(dataset.credentials);
    setRequirementsText(dataset.requirementsRaw);
    setOpportunityTitle(dataset.opportunityTitle);
    setCvData(null);

    const messageText = `Loaded example: ${dataset.opportunityTitle} with 3 candidate credentials.`;
    
    setConversationHistory(prev => [
      ...prev,
      {
        role: 'alexa',
        type: 'sample_loaded',
        text: messageText,
        timestamp: new Date()
      }
    ]);

    if (autoEvaluate) {
      executeMatchEvaluation(dataset.credentials, dataset.requirementsRaw, null, dataset.opportunityTitle);
    } else {
      speakText(`${messageText} Tap "Alexa, do I qualify for this fellowship?" to evaluate.`);
    }
  };

  // Match evaluation execution
  const executeMatchEvaluation = (credsToUse, reqsToUse, cvToUse, titleToUse) => {
    setIsProcessing(true);
    stopSpeaking();

    // Call existing MatchCred match function
    const evalResult = evaluateRequirements(credsToUse, reqsToUse, cvToUse);
    setReport(evalResult);

    const { totalRequirements, matchedCount, unmetCount, unclearCount, items } = evalResult;
    const percentMatch = totalRequirements > 0 ? Math.round((matchedCount / totalRequirements) * 100) : 0;

    // Determine the next step recommendation
    let nextStepText = '';
    let spokenNextStep = '';

    if (percentMatch === 100) {
      nextStepText = 'You satisfy all opportunity criteria! Your next step is to assemble your portfolio and proceed directly to submission.';
      spokenNextStep = 'You meet 100% of the criteria. Your next step is to proceed directly to application submission.';
    } else if (unmetCount > 0 || unclearCount > 0) {
      nextStepText = `You have ${unmetCount} unmet and ${unclearCount} unclear requirement${unclearCount === 1 ? '' : 's'}. Your next step is to enter MatchCred's "Help Me Prepare" mode to document unrecorded practical experience or bridge missing qualifications before applying.`;
      spokenNextStep = `Next step: Enter MatchCred's Preparation mode to document your experience and address the gaps before submitting.`;
    } else {
      nextStepText = 'Review your application documents and verify issuer references before submitting.';
      spokenNextStep = 'Your next step is to verify references and prepare your application package.';
    }

    const titleDisplay = titleToUse || 'this opportunity';
    
    // Spoken response formula: percent match, met, unclear, not met, and the next step
    const speechScript = `Based on MatchCred's evaluation for ${titleDisplay}: you have a ${percentMatch}% match. You have met ${matchedCount} requirements, ${unclearCount} is unclear, and ${unmetCount} is not met. ${spokenNextStep}`;

    const resultPayload = {
      percentMatch,
      matchedCount,
      unclearCount,
      unmetCount,
      totalRequirements,
      nextStep: nextStepText,
      items,
      opportunityTitle: titleDisplay,
      spokenScript: speechScript,
      evaluatedAt: new Date()
    };

    setActiveResult(resultPayload);
    setIsProcessing(false);

    // Add to dialogue history
    setConversationHistory(prev => [
      ...prev,
      {
        role: 'alexa',
        type: 'result',
        text: speechScript,
        result: resultPayload,
        timestamp: new Date()
      }
    ]);

    // Speak the result aloud using browser speech
    speakText(speechScript);
  };

  // Handle user asking "Alexa, do I qualify for this fellowship?" or custom question
  const handleAsk = (queryText) => {
    const query = (queryText || userInput).trim();
    if (!query) return;

    stopSpeaking();

    // Append user message
    setConversationHistory(prev => [
      ...prev,
      {
        role: 'user',
        text: query,
        timestamp: new Date()
      }
    ]);

    // Check if CV/credentials and opportunity requirements are already loaded
    if (!hasCredentials || !hasRequirements) {
      const missingPrompt = !hasCredentials && !hasRequirements
        ? 'To check if you qualify, I need your CV or credentials and the fellowship requirements. You can add them below or tap “Try the example”.'
        : !hasCredentials
        ? 'I have the opportunity requirements, but I still need your CV or credentials to evaluate your eligibility.'
        : 'I have your credentials, but I need the fellowship requirements text to perform the match.';

      setConversationHistory(prev => [
        ...prev,
        {
          role: 'alexa',
          type: 'missing_info_prompt',
          text: missingPrompt,
          timestamp: new Date()
        }
      ]);

      speakText(missingPrompt);
      return;
    }

    // Both are loaded: execute match!
    executeMatchEvaluation(credentials, requirementsText, cvData, opportunityTitle);
  };

  // Add a manual credential from within the Alexa interface
  const handleAddManualCred = (e) => {
    e.preventDefault();
    if (!manualCredName.trim()) return;

    const newCred = {
      id: `alexa-cred-${Date.now()}`,
      name: manualCredName.trim(),
      issuer: manualCredIssuer.trim() || 'Candidate Self-Reported',
      year: manualCredYear.trim() || new Date().getFullYear().toString(),
      status: 'Candidate submitted',
      documentRef: `Ref #${Date.now().toString().slice(-6)}`
    };

    setCredentials([newCred, ...(credentials || [])]);
    setManualCredName('');
    setManualCredIssuer('');
  };

  // Parse pasted CV text
  const handleParsePastedCv = () => {
    if (!pastedCvText.trim()) return;
    const extracted = extractStructuredCvData(pastedCvText);
    setCvData(extracted);
    setPastedCvText('');
  };

  // Apply custom requirements text
  const handleApplyRequirements = (e) => {
    e.preventDefault();
    if (!customReqs.trim()) return;
    setRequirementsText(customReqs.trim());
    if (customTitle.trim()) {
      setOpportunityTitle(customTitle.trim());
    }
  };

  return (
    <div className="alexa-experience-container">
      {/* Alexa Top Header */}
      <div className="alexa-top-header">
        <div className="alexa-brand-block">
          <div className={`alexa-ring-indicator ${isSpeaking ? 'speaking' : isListening ? 'listening' : ''}`}>
            <span className="alexa-ring-core" />
          </div>
          <div>
            <div className="alexa-title-row">
              <span className="alexa-badge">Simulated Alexa+ experience</span>
              <span className="alexa-sub-badge">No official Alexa SDK</span>
            </div>
            <h1 className="alexa-main-title">Alexa+ Fellowship Match</h1>
          </div>
        </div>

        <div className="alexa-controls-right">
          {/* Audio voice toggle */}
          <button
            type="button"
            className={`alexa-icon-btn ${voiceMuted ? 'muted' : ''}`}
            onClick={() => {
              if (!voiceMuted) stopSpeaking();
              setVoiceMuted(!voiceMuted);
            }}
            title={voiceMuted ? "Unmute Alexa voice" : "Mute Alexa voice"}
            aria-label={voiceMuted ? "Unmute Alexa voice" : "Mute Alexa voice"}
          >
            {voiceMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span className="text-xs">{voiceMuted ? 'Muted' : 'Voice on'}</span>
          </button>

          {/* Return to standard MatchCred */}
          {onBackToMain && (
            <button
              type="button"
              className="alexa-nav-back-btn"
              onClick={onBackToMain}
            >
              <span>Back to MatchCred</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Screen Display & Conversation */}
      <div className="alexa-screen-stage">
        {/* Left Side: Ambient Display & Status */}
        <div className="alexa-ambient-card">
          <div className="alexa-ambient-halo" />
          
          <div className="alexa-display-header">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs uppercase tracking-wider text-cyan-300 font-bold">
                Smart Screen Context
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">localhost /alexa</span>
          </div>

          {/* Context Monitor Cards */}
          <div className="alexa-context-grid">
            <div className={`alexa-context-tile ${hasCredentials ? 'active' : 'empty'}`}>
              <div className="tile-icon">
                <FileText size={16} />
              </div>
              <div className="tile-info">
                <span className="tile-label">Candidate Credentials / CV</span>
                <span className="tile-value">
                  {cvData 
                    ? `CV Loaded (${cvData.skills?.length || 0} skills, ${cvData.education?.length || 0} degrees)` 
                    : credentials && credentials.length > 0 
                    ? `${credentials.length} Credential${credentials.length === 1 ? '' : 's'} on file`
                    : 'None loaded'}
                </span>
              </div>
              <div className="tile-status">
                {hasCredentials ? <Check size={14} className="text-emerald-400" /> : <span className="text-amber-400 text-xs">Missing</span>}
              </div>
            </div>

            <div className={`alexa-context-tile ${hasRequirements ? 'active' : 'empty'}`}>
              <div className="tile-icon">
                <Sparkles size={16} />
              </div>
              <div className="tile-info">
                <span className="tile-label">Opportunity Requirements</span>
                <span className="tile-value" title={opportunityTitle || requirementsText}>
                  {opportunityTitle || (hasRequirements ? 'Custom requirements loaded' : 'None loaded')}
                </span>
              </div>
              <div className="tile-status">
                {hasRequirements ? <Check size={14} className="text-emerald-400" /> : <span className="text-amber-400 text-xs">Missing</span>}
              </div>
            </div>
          </div>

          {/* Try the Example Callout Box */}
          <div className="alexa-example-callout">
            <div className="example-header">
              <span className="text-xs font-semibold uppercase text-cyan-300 tracking-wide flex items-center gap-1.5">
                <Sparkles size={14} /> Quick Demo
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Load the sample <strong>Product Design Fellowship</strong> with candidate credentials to experience the voice match instantly.
            </p>
            <button
              type="button"
              className="alexa-example-btn"
              onClick={() => handleLoadSampleFellowship(true)}
            >
              <Sparkles size={16} />
              <span>Try the example</span>
            </button>
          </div>

          {/* Open full app navigation */}
          {activeResult && onOpenMatchCred && (
            <div className="alexa-app-bridge">
              <p className="text-xs text-slate-300 mb-2">
                Need to act on this result? Continue in MatchCred's full preparation workspace:
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="alexa-bridge-btn primary"
                  onClick={() => onOpenMatchCred('preparation')}
                >
                  <span>Open "Help Me Prepare"</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  className="alexa-bridge-btn"
                  onClick={() => onOpenMatchCred('results')}
                >
                  <span>View Full Match Report</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Simulated Alexa Generative UI Screen */}
        <div className="alexa-chat-display">
          {/* Active Speaking Waveform Bar */}
          {isSpeaking && (
            <div className="alexa-speech-indicator-bar" aria-live="polite">
              <div className="flex items-center gap-2">
                <div className="alexa-wave-animation">
                  <span /><span /><span /><span /><span />
                </div>
                <span className="text-xs font-medium text-cyan-300">
                  Alexa is speaking...
                </span>
              </div>
              <button
                type="button"
                className="alexa-speech-stop-btn"
                onClick={stopSpeaking}
              >
                <Square size={12} />
                <span>Stop voice</span>
              </button>
            </div>
          )}

          {/* Dialogue Message Feed */}
          <div className="alexa-conversation-feed">
            {conversationHistory.map((msg, index) => (
              <div key={index} className={`alexa-bubble-row ${msg.role}`}>
                {msg.role === 'alexa' && (
                  <div className="alexa-avatar-dot">
                    <span className="dot-inner" />
                  </div>
                )}

                <div className={`alexa-bubble ${msg.role} ${msg.type || ''}`}>
                  {/* Spoken Text Fallback / Content */}
                  <div className="alexa-bubble-text">
                    {msg.text}
                  </div>

                  {/* If this message is a result card, display the rich evaluation breakdown */}
                  {msg.result && (
                    <div className="alexa-result-card">
                      {/* Metric Banner */}
                      <div className="alexa-score-banner">
                        <div className="alexa-score-ring">
                          <span className="alexa-score-number">{msg.result.percentMatch}%</span>
                          <span className="alexa-score-label">MATCH</span>
                        </div>
                        <div className="alexa-score-breakdown">
                          <div className="pill-badge met">
                            <CheckCircle2 size={15} />
                            <span>{msg.result.matchedCount} MET</span>
                          </div>
                          <div className="pill-badge unclear">
                            <HelpCircle size={15} />
                            <span>{msg.result.unclearCount} UNCLEAR</span>
                          </div>
                          <div className="pill-badge unmet">
                            <AlertCircle size={15} />
                            <span>{msg.result.unmetCount} NOT MET</span>
                          </div>
                        </div>
                      </div>

                      {/* Next Step Callout */}
                      <div className="alexa-next-step-box">
                        <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider mb-1">
                          <Sparkles size={14} /> Recommended Next Step
                        </div>
                        <p className="text-sm font-medium text-white leading-relaxed">
                          {msg.result.nextStep}
                        </p>
                      </div>

                      {/* Detailed Item List */}
                      {msg.result.items && msg.result.items.length > 0 && (
                        <div className="alexa-items-list">
                          <div className="text-xs uppercase font-semibold text-slate-400 mb-2">
                            Requirement-by-Requirement Evidence:
                          </div>
                          {msg.result.items.map((item, idx) => (
                            <div key={idx} className={`alexa-item-row ${item.status.toLowerCase().replace(' ', '-')}`}>
                              <div className="item-header">
                                <span className={`status-pill ${item.status.toLowerCase().replace(' ', '-')}`}>
                                  {item.status}
                                </span>
                                <span className="item-req-text font-medium text-slate-200">
                                  {item.requirement}
                                </span>
                              </div>
                              {item.explanation && (
                                <p className="item-explanation text-xs text-slate-400 mt-1">
                                  {item.explanation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Speech Replay Button */}
                      <div className="alexa-result-actions">
                        <button
                          type="button"
                          className="alexa-btn-sm"
                          onClick={() => speakText(msg.result.spokenScript)}
                        >
                          <Play size={13} />
                          <span>Replay Spoken Summary</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* If missing information prompt, render quick upload/input drawer */}
                  {msg.type === 'missing_info_prompt' && (
                    <div className="alexa-missing-prompt-box">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                          Provide Opportunity Data
                        </span>
                        <button
                          type="button"
                          className="text-xs text-cyan-400 underline font-medium hover:text-cyan-300 cursor-pointer"
                          onClick={() => handleLoadSampleFellowship(true)}
                        >
                          Or tap “Try the example”
                        </button>
                      </div>

                      {/* Tab toggles */}
                      <div className="flex gap-2 border-b border-slate-700 pb-2 mb-3 text-xs">
                        <button
                          type="button"
                          className={`px-3 py-1 rounded cursor-pointer ${missingInputTab === 'upload' ? 'bg-cyan-900/50 text-cyan-300 font-bold' : 'text-slate-400'}`}
                          onClick={() => setMissingInputTab('upload')}
                        >
                          Upload / Paste CV
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded cursor-pointer ${missingInputTab === 'manual' ? 'bg-cyan-900/50 text-cyan-300 font-bold' : 'text-slate-400'}`}
                          onClick={() => setMissingInputTab('manual')}
                        >
                          Add Credential Manually
                        </button>
                      </div>

                      {missingInputTab === 'upload' ? (
                        <div className="space-y-3">
                          <textarea
                            className="alexa-quick-textarea"
                            placeholder="Paste your CV or qualifications text here..."
                            rows={3}
                            value={pastedCvText}
                            onChange={(e) => setPastedCvText(e.target.value)}
                          />
                          <button
                            type="button"
                            className="alexa-btn-sm primary"
                            disabled={!pastedCvText.trim()}
                            onClick={handleParsePastedCv}
                          >
                            <Check size={14} />
                            <span>Save CV Data</span>
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleAddManualCred} className="space-y-2">
                          <input
                            type="text"
                            className="alexa-quick-input"
                            placeholder="Credential name (e.g. Bachelor of Design)"
                            value={manualCredName}
                            onChange={(e) => setManualCredName(e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              className="alexa-quick-input"
                              placeholder="Issuer / University"
                              value={manualCredIssuer}
                              onChange={(e) => setManualCredIssuer(e.target.value)}
                            />
                            <input
                              type="text"
                              className="alexa-quick-input"
                              placeholder="Year (e.g. 2024)"
                              value={manualCredYear}
                              onChange={(e) => setManualCredYear(e.target.value)}
                            />
                          </div>
                          <button
                            type="submit"
                            className="alexa-btn-sm primary"
                            disabled={!manualCredName.trim()}
                          >
                            <Check size={14} />
                            <span>Add Credential</span>
                          </button>
                        </form>
                      )}

                      {!hasRequirements && (
                        <div className="mt-4 pt-3 border-t border-slate-700/60">
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Opportunity Title &amp; Requirements Text:
                          </label>
                          <input
                            type="text"
                            className="alexa-quick-input mb-2"
                            placeholder="Opportunity Title (e.g. Acme Tech Fellowship)"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                          />
                          <textarea
                            className="alexa-quick-textarea"
                            placeholder="Paste opportunity requirements (bullet points or criteria)..."
                            rows={3}
                            value={customReqs}
                            onChange={(e) => setCustomReqs(e.target.value)}
                          />
                          <button
                            type="button"
                            className="alexa-btn-sm primary mt-2"
                            disabled={!customReqs.trim()}
                            onClick={handleApplyRequirements}
                          >
                            <Check size={14} />
                            <span>Set Requirements</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick-Prompt Tap Buttons */}
          <div className="alexa-quick-prompts">
            <span className="text-xs text-slate-400 font-medium">Quick Prompts:</span>
            
            {/* Main specified button */}
            <button
              type="button"
              className="alexa-prompt-chip primary"
              onClick={() => {
                setUserInput('Alexa, do I qualify for this fellowship?');
                handleAsk('Alexa, do I qualify for this fellowship?');
              }}
            >
              <span>“Alexa, do I qualify for this fellowship?”</span>
            </button>

            <button
              type="button"
              className="alexa-prompt-chip"
              onClick={() => handleLoadSampleFellowship(true)}
            >
              <Sparkles size={13} />
              <span>Try the example</span>
            </button>

            {activeResult && (
              <button
                type="button"
                className="alexa-prompt-chip"
                onClick={() => {
                  const q = 'What is my next step?';
                  setUserInput(q);
                  handleAsk(q);
                }}
              >
                <span>“What is my next step?”</span>
              </button>
            )}
          </div>

          {/* Input Bar with Voice & Text input */}
          <div className="alexa-input-bar">
            <button
              type="button"
              className={`alexa-mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              title={isListening ? "Listening... click to stop" : "Speak to Alexa"}
              aria-label="Microphone input"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              className="alexa-text-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask Alexa or type your question..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAsk();
                }
              }}
            />

            <button
              type="button"
              className="alexa-send-btn"
              onClick={() => handleAsk()}
              disabled={isProcessing}
            >
              {isProcessing ? 'Evaluating...' : 'Ask'}
            </button>
          </div>

          {/* Text Fallback & Accessibility Notice */}
          <div className="alexa-footer-note">
            <Info size={12} />
            <span>
              Voice rendered via browser SpeechSynthesis with complete on-screen text transcripts. Simulated Alexa+ experience.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
