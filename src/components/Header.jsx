import React from 'react';
import Logo from './Logo';

export default function Header({ currentScreen, setCurrentScreen, hasEvaluated, onBackToLanding }) {
  const steps = [
    { id: 'credentials', label: 'Credentials or CV', stepNum: 1 },
    { id: 'requirements', label: 'Opportunity', stepNum: 2 },
    { id: 'results', label: 'Match Results', stepNum: 3, disabled: !hasEvaluated },
    { id: 'preparation', label: 'Help Me Prepare', stepNum: 4, disabled: !hasEvaluated },
    { id: 'application', label: 'Application', stepNum: 5, disabled: !hasEvaluated }
  ];

  const getStepIndex = (screenId) => {
    switch (screenId) {
      case 'credentials': return 0;
      case 'requirements': return 1;
      case 'results': return 2;
      case 'preparation':
      case 'plan': return 3;
      case 'application': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentScreen);

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="flex items-center gap-4">
          <div 
            className="brand"
            onClick={onBackToLanding || (() => setCurrentScreen('home'))}
            role="button"
            tabIndex={0}
            title="Return to MatchCred Landing Page"
          >
            <Logo size={36} variant="dark" />
          </div>

          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="text-xs font-mono font-medium text-[rgba(215,226,234,0.6)] hover:text-white px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>←</span>
              <span>Overview</span>
            </button>
          )}
        </div>

        <nav className="step-nav" aria-label="Workflow progress">
          {steps.map((step, idx) => {
            const stepIdx = getStepIndex(step.id);
            const isActive = stepIdx === currentIndex;
            const isCompleted = stepIdx < currentIndex;

            return (
              <React.Fragment key={step.id}>
                {idx > 0 && <span className="step-sep">/</span>}
                <button
                  type="button"
                  className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => !step.disabled && setCurrentScreen(step.id)}
                  disabled={step.disabled}
                >
                  <span className="step-number">
                    {isCompleted ? '✓' : step.stepNum}
                  </span>
                  <span>{step.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
