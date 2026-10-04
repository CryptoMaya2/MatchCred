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
  Play, 
  Square,
  Maximize2,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { evaluateRequirements, SAMPLE_DATASETS } from '../services/requirementMatcher';

export default function EmbeddedAlexaWidget({
  credentials = [],
  cvData = null,
  requirementsText = '',
  opportunityTitle = '',
  onLoadPreset,
  onOpenAlexaFullScreen,
  onProceedToPrep,
  onProceedToResults
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [userInput, setUserInput] = useState('Alexa, do I qualify for this fellowship?');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [activeResult, setActiveResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Tap “Alexa, do I qualify for this fellowship?” or ask using your microphone.');
  const speechUtteranceRef = useRef(null);

  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const hasCredentials = (credentials && credentials.length > 0) || Boolean(cvData);
  const hasRequirements = Boolean(requirementsText && requirementsText.trim().length > 0);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  const executeMatch = (credsToUse, reqsToUse, cvToUse, titleToUse) => {
    stopSpeaking();
    const evalResult = evaluateRequirements(credsToUse, reqsToUse, cvToUse);
    const { totalRequirements, matchedCount, unmetCount, unclearCount, items } = evalResult;
    const percentMatch = totalRequirements > 0 ? Math.round((matchedCount / totalRequirements) * 100) : 0;

    let nextStepText = '';
    let spokenNextStep = '';

    if (percentMatch === 100) {
      nextStepText = 'You satisfy all opportunity criteria! Your next step is to assemble your portfolio and proceed directly to submission.';
      spokenNextStep = 'You meet 100% of the criteria. Your next step is to proceed directly to application submission.';
    } else if (unmetCount > 0 || unclearCount > 0) {
      nextStepText = `You have ${unmetCount} unmet and ${unclearCount} unclear requirement${unclearCount === 1 ? '' : 's'}. Next step: enter MatchCred's "Help Me Prepare" mode to document practical experience or bridge gaps before submitting.`;
      spokenNextStep = `Next step: enter MatchCred's Preparation mode to document your experience and address the gaps before submitting.`;
    } else {
      nextStepText = 'Review your application documents and verify issuer references before submitting.';
      spokenNextStep = 'Your next step is to verify references and prepare your application package.';
    }

    const titleDisplay = titleToUse || 'this opportunity';
    const speechScript = `Based on MatchCred's evaluation for ${titleDisplay}: you have a ${percentMatch}% match. You have ${matchedCount} requirements met, ${unclearCount} unclear, and ${unmetCount} not met. ${spokenNextStep}`;

    const payload = {
      percentMatch,
      matchedCount,
      unclearCount,
      unmetCount,
      totalRequirements,
      nextStep: nextStepText,
      items,
      opportunityTitle: titleDisplay,
      spokenScript: speechScript
    };

    setActiveResult(payload);
    setStatusMessage(speechScript);
    speakText(speechScript);
  };

  const handleAsk = (queryText) => {
    const query = (queryText || userInput).trim();
    if (!query) return;

    stopSpeaking();

    // Check if credentials & requirements are loaded
    if (!hasCredentials || !hasRequirements) {
      // Auto-load fellowship if the user specifically asked about the fellowship and it's not loaded
      if (query.toLowerCase().includes('fellowship') && onLoadPreset) {
        onLoadPreset('fellowship');
        const dataset = SAMPLE_DATASETS.fellowship;
        if (dataset) {
          executeMatch(dataset.credentials, dataset.requirementsRaw, null, dataset.opportunityTitle);
          return;
        }
      }

      const msg = !hasCredentials && !hasRequirements
        ? 'I need your credentials or CV and opportunity requirements to evaluate your eligibility. Tap “Try the example” to load sample fellowship data or add credentials below.'
        : !hasCredentials
        ? 'I have the opportunity requirements, but need your credentials or CV to evaluate.'
        : 'I have your credentials, but need the opportunity requirements text to perform the match.';

      setStatusMessage(msg);
      speakText(msg);
      return;
    }

    executeMatch(credentials, requirementsText, cvData, opportunityTitle);
  };

  const handleTryExample = () => {
    if (onLoadPreset) {
      onLoadPreset('fellowship');
    }
    const dataset = SAMPLE_DATASETS.fellowship;
    if (dataset) {
      executeMatch(dataset.credentials, dataset.requirementsRaw, null, dataset.opportunityTitle);
    }
  };

  return (
    <div className="alexa-embedded-card" style={{
      background: 'linear-gradient(135deg, rgba(13, 21, 38, 0.95), rgba(20, 31, 54, 0.92))',
      border: '1px solid rgba(0, 202, 255, 0.35)',
      borderRadius: '16px',
      padding: '1.25rem',
      marginBottom: '1.75rem',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 202, 255, 0.12)',
      color: '#e2e8f0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 202, 255, 0.25) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className={`alexa-ring-indicator ${isSpeaking ? 'speaking' : isListening ? 'listening' : ''}`} style={{ width: '30px', height: '30px' }}>
            <span className="alexa-ring-core" style={{ width: '14px', height: '14px' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="alexa-badge" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                Simulated Alexa+ Assistant
              </span>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                No official Alexa SDK
              </span>
            </div>
            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Voice &amp; Ambient Eligibility Check
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`alexa-icon-btn ${voiceMuted ? 'muted' : ''}`}
            onClick={() => {
              if (!voiceMuted) stopSpeaking();
              setVoiceMuted(!voiceMuted);
            }}
            title={voiceMuted ? "Unmute Alexa voice" : "Mute Alexa voice"}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            {voiceMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>{voiceMuted ? 'Muted' : 'Voice on'}</span>
          </button>

          {onOpenAlexaFullScreen && (
            <button
              type="button"
              className="alexa-btn-sm"
              onClick={onOpenAlexaFullScreen}
              title="Open full smart screen at /alexa"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              <Maximize2 size={14} />
              <span>Full Screen (/alexa)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isExpanded ? "Collapse assistant" : "Expand assistant"}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Active Speaking Indicator */}
          {isSpeaking && (
            <div className="alexa-speech-indicator-bar" style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="alexa-wave-animation">
                  <span /><span /><span /><span /><span />
                </div>
                <span style={{ fontSize: '0.8rem', color: '#7de2ff', fontWeight: 600 }}>
                  Alexa is speaking...
                </span>
              </div>
              <button
                type="button"
                className="alexa-speech-stop-btn"
                onClick={stopSpeaking}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                <Square size={12} />
                <span>Stop voice</span>
              </button>
            </div>
          )}

          {/* Assistant dialogue/status bubble */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(0, 202, 255, 0.2)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '0.9rem',
            fontSize: '0.88rem',
            color: '#cbd5e1',
            lineHeight: 1.5
          }}>
            <strong style={{ color: '#00caff', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
              Alexa Response:
            </strong>
            {statusMessage}
          </div>

          {/* Result Card (When evaluated) */}
          {activeResult && (
            <div style={{
              background: 'rgba(10, 16, 28, 0.9)',
              border: '1px solid rgba(0, 202, 255, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'conic-gradient(#00caff 0%, #7c5cfc 75%, #1e293b 75%)',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 0 15px rgba(0, 202, 255, 0.35)'
                  }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: '#0b1120',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <strong style={{ fontSize: '0.95rem', color: '#ffffff', lineHeight: 1 }}>
                        {activeResult.percentMatch}%
                      </strong>
                      <span style={{ fontSize: '0.55rem', color: '#7de2ff', fontWeight: 700 }}>
                        MATCH
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div className="pill-badge met" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                      <CheckCircle2 size={13} />
                      <span>{activeResult.matchedCount} MET</span>
                    </div>
                    <div className="pill-badge unclear" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                      <HelpCircle size={13} />
                      <span>{activeResult.unclearCount} UNCLEAR</span>
                    </div>
                    <div className="pill-badge unmet" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                      <AlertCircle size={13} />
                      <span>{activeResult.unmetCount} NOT MET</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="alexa-btn-sm"
                    onClick={() => speakText(activeResult.spokenScript)}
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  >
                    <Play size={12} />
                    <span>Replay Voice</span>
                  </button>
                  {onProceedToPrep && (
                    <button
                      type="button"
                      className="alexa-btn-sm primary"
                      onClick={onProceedToPrep}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                    >
                      <span>Help Me Prepare</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Next step highlight */}
              <div style={{
                background: 'rgba(0, 202, 255, 0.08)',
                border: '1px solid rgba(0, 202, 255, 0.25)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.82rem',
                color: '#f8fafc'
              }}>
                <span style={{ color: '#00caff', fontWeight: 700, marginRight: '0.4rem' }}>
                  Next Step:
                </span>
                {activeResult.nextStep}
              </div>
            </div>
          )}

          {/* Quick interactive prompts row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
              Quick Actions:
            </span>

            <button
              type="button"
              className="alexa-prompt-chip primary"
              onClick={() => {
                setUserInput('Alexa, do I qualify for this fellowship?');
                handleAsk('Alexa, do I qualify for this fellowship?');
              }}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
            >
              <span>“Alexa, do I qualify for this fellowship?”</span>
            </button>

            <button
              type="button"
              className="alexa-prompt-chip"
              onClick={handleTryExample}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
            >
              <Sparkles size={13} />
              <span>Try the fellowship example</span>
            </button>
          </div>

          {/* Input & voice bar */}
          <div className="alexa-input-bar" style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.4rem 0.6rem' }}>
            <button
              type="button"
              className={`alexa-mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              title={isListening ? "Listening... click to stop" : "Speak to Alexa"}
              style={{ width: '34px', height: '34px' }}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              className="alexa-text-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask Alexa or type your eligibility query..."
              style={{ fontSize: '0.85rem' }}
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
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              Ask
            </button>
          </div>
        </>
      )}
    </div>
  );
}
