import React, { useState } from 'react';
import Question from './Question';
import DrawQuestion from './DrawQuestion';
import WordTranslateQuestion from './WordTranslateQuestion';
import Summary from './Summary';

const Game = ({ decidedGroups, handleEndGame, stage, questionCount }) => {
  const [showSummary, setShowSummary] = useState(false);
  const [results, setResults] = useState([]);

  const handleStageComplete = (newResults) => {
    setShowSummary(true);
    setResults(newResults || []);
  };

  if (showSummary) {
    return (
      <Summary
        results={results}
        onBackToMenu={handleEndGame}
      />
    );
  }

  return (
    <div>
      {stage === 6 ? (
        <WordTranslateQuestion
          handleStageComplete={handleStageComplete}
          stage={stage}
          decidedGroups={decidedGroups}
          questionCount={questionCount}
        />
      ) : stage === 5 ? (
        <DrawQuestion
          handleStageComplete={handleStageComplete}
          stage={stage}
          decidedGroups={decidedGroups}
          questionCount={questionCount}
        />
      ) : (
        <Question
          handleStageComplete={handleStageComplete}
          stage={stage}
          decidedGroups={decidedGroups}
          questionCount={questionCount}
        />
      )}
    </div>
  );
};

export default Game;
