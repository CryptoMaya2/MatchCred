import React, { useState } from 'react';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import CredentialsScreen from './components/CredentialsScreen';
import RequirementsScreen from './components/RequirementsScreen';
import ResultsScreen from './components/ResultsScreen';
import PreparationScreen from './components/PreparationScreen';
import PreparationPlanScreen from './components/PreparationPlanScreen';
import ApplicationScreen from './components/ApplicationScreen';
import LandingPage from './components/landing/LandingPage';
import SimulatedAlexaScreen from './components/SimulatedAlexaScreen';
import { evaluateRequirements, SAMPLE_DATASETS } from './services/requirementMatcher';
import { evaluateRequirementsViaGenLayer } from './services/genlayerService';

function getInitialViewMode() {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (path.startsWith('/alexa') || hash.startsWith('#/alexa') || search.includes('alexa')) {
      return 'alexa';
    }
  }
  return 'landing';
}

export default function App() {
  // View mode: 'landing' | 'app' | 'alexa'
  const [viewMode, setViewMode] = useState(getInitialViewMode);
  const [currentScreen, setCurrentScreen] = useState('credentials');

  // User credentials state - starts empty by default, allowing user to enter their own credentials
  const [credentials, setCredentials] = useState([]);

  // CV data state - candidate provided CV extraction
  const [cvData, setCvData] = useState(null);

  // Input mode: 'credentials' | 'cv' | 'both'
  const [inputMode, setInputMode] = useState('credentials');

  // Opportunity requirements text state - starts empty by default
  const [requirementsText, setRequirementsText] = useState('');
  const [opportunityTitle, setOpportunityTitle] = useState('');

  // Active example preset tracker to distinguish sample data from user data
  const [activePreset, setActivePreset] = useState(null);

  // Evaluation report state
  const [report, setReport] = useState(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState('');

  // Experience and preparation notes saved during "Help Me Prepare"
  const [savedExperiences, setSavedExperiences] = useState([]);

  // Transition from landing page into application workflow
  const handleOpenApp = (targetScreen = 'credentials') => {
    setCurrentScreen(targetScreen);
    setViewMode('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handlers for Credentials
  const handleAddCredential = (newCred) => {
    // If user adds their own credential to a demo preset, transition from demo to user data
    if (activePreset) {
      setActivePreset(null);
    }
    setCredentials((prev) => [newCred, ...prev]);

    // If report exists, re-evaluate automatically so additions reflect in results
    if (report && requirementsText) {
      const updatedCreds = [newCred, ...credentials];
      const reEvaluated = evaluateRequirements(updatedCreds, requirementsText, cvData);
      setReport(reEvaluated);
    }
  };

  const handleRemoveCredential = (id) => {
    setCredentials((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClearCredentials = () => {
    setCredentials([]);
    setActivePreset(null);
  };

  const handleSaveExperience = (exp) => {
    setSavedExperiences((prev) => [...prev, exp]);
  };

  const handleLoadPreset = (key) => {
    const dataset = SAMPLE_DATASETS[key];
    if (dataset) {
      setCredentials(dataset.credentials);
      setRequirementsText(dataset.requirementsRaw);
      setOpportunityTitle(dataset.opportunityTitle);
      setActivePreset({ key: dataset.key, name: dataset.title, category: dataset.category });
      setCvData(null);
      setInputMode('credentials');
      setSavedExperiences([]);
      setReport(null);
      setHasEvaluated(false);
    }
  };

  const handleClearPreset = () => {
    setCredentials([]);
    setCvData(null);
    setInputMode('credentials');
    setRequirementsText('');
    setOpportunityTitle('');
    setActivePreset(null);
    setSavedExperiences([]);
    setReport(null);
    setHasEvaluated(false);
  };

  // Perform evaluation using GenLayer Studionet service
  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setEvaluationError('');
    try {
      const evalResult = await evaluateRequirementsViaGenLayer(credentials, requirementsText, cvData);
      setReport(evalResult);
      setHasEvaluated(true);
      setCurrentScreen('results');
    } catch (err) {
      setEvaluationError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handle popstate for browser navigation (back/forward)
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path.startsWith('/alexa') || hash.startsWith('#/alexa') || search.includes('alexa')) {
        setViewMode('alexa');
      } else if (viewMode === 'alexa') {
        setViewMode('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [viewMode]);

  const handleOpenAlexa = () => {
    if (window.location.pathname !== '/alexa') {
      window.history.pushState(null, '', '/alexa');
    }
    setViewMode('alexa');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromAlexa = (targetScreen = 'landing') => {
    if (window.location.pathname === '/alexa') {
      window.history.pushState(null, '', '/');
    }
    if (targetScreen === 'landing') {
      setViewMode('landing');
    } else {
      setViewMode('app');
      setCurrentScreen(targetScreen);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetOpportunity = () => {
    setRequirementsText('');
    setOpportunityTitle('');
    setReport(null);
    setSavedExperiences([]);
    setCurrentScreen('requirements');
  };

  // If in simulated Alexa+ view mode, render SimulatedAlexaScreen at /alexa
  if (viewMode === 'alexa') {
    return (
      <div className="app-container">
        <SimulatedAlexaScreen
          credentials={credentials}
          setCredentials={setCredentials}
          cvData={cvData}
          setCvData={setCvData}
          requirementsText={requirementsText}
          setRequirementsText={setRequirementsText}
          opportunityTitle={opportunityTitle}
          setOpportunityTitle={setOpportunityTitle}
          report={report}
          setReport={setReport}
          onOpenMatchCred={(targetScreen) => {
            handleBackFromAlexa(targetScreen || 'results');
          }}
          onBackToMain={() => handleBackFromAlexa('landing')}
        />
      </div>
    );
  }

  // If in landing view mode, render the refined, spacious 3D Landing Page
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onOpenApp={handleOpenApp}
        onOpenAlexa={handleOpenAlexa}
      />
    );
  }

  // Dashboard / Evaluation application flow
  return (
    <div className="app-container">
      <Header
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        hasEvaluated={hasEvaluated}
        hasPrepared={savedExperiences.length > 0}
        onBackToLanding={() => setViewMode('landing')}
        onOpenAlexa={handleOpenAlexa}
      />

      <main className="main-content">
        {currentScreen === 'home' && (
          <HomeScreen
            onStart={() => setCurrentScreen('credentials')}
            onLoadSample={(key) => {
              handleLoadPreset(key);
              setCurrentScreen('credentials');
            }}
          />
        )}

        {currentScreen === 'credentials' && (
          <CredentialsScreen
            credentials={credentials}
            cvData={cvData}
            onChangeCvData={setCvData}
            inputMode={inputMode}
            setInputMode={setInputMode}
            activePreset={activePreset}
            onAddCredential={handleAddCredential}
            onRemoveCredential={handleRemoveCredential}
            onLoadPreset={handleLoadPreset}
            onClearPreset={handleClearPreset}
            onClearCredentials={handleClearCredentials}
            onContinue={() => setCurrentScreen('requirements')}
            onBack={() => setViewMode('landing')}
            requirementsText={requirementsText}
            opportunityTitle={opportunityTitle}
            onOpenAlexa={handleOpenAlexa}
            onProceedToPrep={() => setCurrentScreen('preparation')}
            onProceedToResults={() => setCurrentScreen('results')}
          />
        )}

        {currentScreen === 'requirements' && (
          <RequirementsScreen
            requirementsText={requirementsText}
            setRequirementsText={setRequirementsText}
            opportunityTitle={opportunityTitle}
            setOpportunityTitle={setOpportunityTitle}
            activePreset={activePreset}
            onLoadPresetRequirements={(key) => {
              const dataset = SAMPLE_DATASETS[key];
              if (dataset) {
                setRequirementsText(dataset.requirementsRaw);
                setOpportunityTitle(dataset.opportunityTitle);
                setActivePreset({ key: dataset.key, name: dataset.title, category: dataset.category });
              }
            }}
            onClearPreset={handleClearPreset}
            onEvaluate={handleEvaluate}
            evaluationError={evaluationError}
            isEvaluating={isEvaluating}
            onBack={() => setCurrentScreen('credentials')}
          />
        )}

        {currentScreen === 'results' && (
          <ResultsScreen
            report={report}
            opportunityTitle={opportunityTitle}
            activePreset={activePreset}
            cvData={cvData}
            onHelpMePrepare={() => setCurrentScreen('preparation')}
            onEditRequirements={() => setCurrentScreen('requirements')}
            onEditCredentials={() => setCurrentScreen('credentials')}
            onReset={handleResetOpportunity}
          />
        )}

        {currentScreen === 'preparation' && (
          <PreparationScreen
            unmetItems={report?.items?.filter(i => i.status === 'NOT MET') || []}
            unclearItems={report?.items?.filter(i => i.status === 'UNCLEAR') || []}
            metItems={report?.items?.filter(i => i.status === 'MET' || i.status === 'MATCH') || []}
            cvData={cvData}
            onAddCredential={handleAddCredential}
            onSaveExperience={handleSaveExperience}
            onProceedToPlan={() => setCurrentScreen('plan')}
            onBackToResults={() => setCurrentScreen('results')}
          />
        )}

        {currentScreen === 'plan' && (
          <PreparationPlanScreen
            report={report}
            credentials={credentials}
            cvData={cvData}
            savedExperiences={savedExperiences}
            onProceedToApplication={() => setCurrentScreen('application')}
            onBackToPrep={() => setCurrentScreen('preparation')}
          />
        )}

        {currentScreen === 'application' && (
          <ApplicationScreen
            credentials={credentials}
            cvData={cvData}
            savedExperiences={savedExperiences}
            opportunityTitle={opportunityTitle}
            onAddCredential={handleAddCredential}
            onBackToPlan={() => setCurrentScreen('plan')}
          />
        )}
      </main>

      <footer className="app-footer">
        <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <strong>MatchCred</strong> — Credential Verification &amp; Application Prep
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Connected to GenLayer Studionet (Chain ID 61999) • Decentralized Consensus Evaluation
          </div>
        </div>
      </footer>
    </div>
  );
}
