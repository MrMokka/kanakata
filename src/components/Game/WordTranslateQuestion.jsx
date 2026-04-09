import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getWordDictionary } from '../../data/wordDictionary';
import { shuffle } from '../../data/helperFuncs';
import './Question.scss';

/*
Stage 6: Word Translation Game
- Shows a Japanese word (in kana) and asks for the English translation
- Text input field for typing the answer
- Progress bar similar to other stages
*/

const WordTranslateQuestion = ({ stage, decidedGroups, questionCount, handleStageComplete }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [previousQuestion, setPreviousQuestion] = useState(null);
  const [previousAnswer, setPreviousAnswer] = useState('');
  const [previousCorrectAnswer, setPreviousCorrectAnswer] = useState('');
  const [wasCorrect, setWasCorrect] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [stageProgress, setStageProgress] = useState(0);
  const [mode, setMode] = useState('jp-to-en');
  const [showKanji, setShowKanji] = useState(true);
  const [results, setResults] = useState([]);

  const availableWordsRef = useRef([]);
  const completedWordsRef = useRef([]);
  const previousQuestionRef = useRef(null);
  const stageProgressRef = useRef(0);
  const resultsRef = useRef([]);
  const currentQuestionRef = useRef(null);

  useEffect(() => {
    availableWordsRef.current = getWordDictionary();
    completedWordsRef.current = [];
    previousQuestionRef.current = null;
    stageProgressRef.current = 0;
    resultsRef.current = [];
  }, []);

  const getRandomWords = useCallback((amount, exclude) => {
    let words = availableWordsRef.current.filter(w => !completedWordsRef.current.includes(w));

    if (words.length === 0) {
      completedWordsRef.current = [];
      words = availableWordsRef.current.slice();
    }

    if (exclude) {
      words = words.filter(w => w !== exclude);
    }
    shuffle(words);
    return words.slice(0, amount);
  }, []);

  const setNewQuestion = useCallback(() => {
    const candidates = getRandomWords(1, previousQuestionRef.current);
    const question = candidates[0];
    currentQuestionRef.current = question;
    setCurrentQuestion(question);
  }, [getRandomWords]);

  const startGame = (selectedMode) => {
    setMode(selectedMode);
    setGameStarted(true);
    availableWordsRef.current = getWordDictionary();
    setNewQuestion();
  };

  const handleAnswer = useCallback((answer) => {
    const answerTrimmed = answer.trim().toLowerCase();
    const word = currentQuestionRef.current;

    let isCorrect = false;
    let allowedAnswers = [];

    if (mode === 'jp-to-en') {
      allowedAnswers = [word.english.toLowerCase(), word.romaji.toLowerCase()];
      isCorrect = allowedAnswers.includes(answerTrimmed);
    } else {
      allowedAnswers = [word.japanese, word.romaji.toLowerCase()];
      if (word.kanji) {
        allowedAnswers.push(word.kanji);
      }
      isCorrect = answerTrimmed === word.japanese ||
        answerTrimmed === word.romaji.toLowerCase() ||
        (word.kanji && answer.trim() === word.kanji);
    }

    previousQuestionRef.current = currentQuestionRef.current;

    let correctAnswerDisplay;
    if (mode === 'jp-to-en') {
      correctAnswerDisplay = word.english;
    } else {
      correctAnswerDisplay = word.kanji
        ? `${word.japanese} / ${word.kanji}`
        : word.japanese;
    }

    const questionDisplay = mode === 'jp-to-en'
      ? `${word.japanese} (${word.romaji})`
      : word.english;

    const resultEntry = {
      question: questionDisplay,
      correctAnswer: correctAnswerDisplay,
      userAnswer: answer,
      correct: isCorrect
    };

    const newResults = [...resultsRef.current, resultEntry];
    resultsRef.current = newResults;
    setResults(newResults);

    setPreviousQuestion(previousQuestionRef.current);
    setPreviousAnswer(answer);
    setPreviousCorrectAnswer(correctAnswerDisplay);
    setWasCorrect(isCorrect);

    if (isCorrect) {
      stageProgressRef.current = stageProgressRef.current + 1;
      if (!completedWordsRef.current.includes(currentQuestionRef.current)) {
        completedWordsRef.current.push(currentQuestionRef.current);
      }
    }
    setStageProgress(stageProgressRef.current);

    if (stageProgressRef.current >= questionCount) {
      handleStageComplete(newResults);
    } else {
      setNewQuestion();
    }
  }, [mode, questionCount, handleStageComplete, setNewQuestion]);

  const handleAnswerChange = (e) => {
    setCurrentAnswer(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentAnswer !== '') {
      handleAnswer(currentAnswer);
      setCurrentAnswer('');
    }
  };

  const handleSkip = () => {
    handleAnswer('');
  };

  const getShowableQuestion = () => {
    if (!currentQuestion) return '';
    if (mode === 'jp-to-en') {
      if (showKanji && currentQuestion.kanji) {
        return currentQuestion.kanji;
      }
      return currentQuestion.japanese;
    } else {
      return currentQuestion.english;
    }
  };

  const getPreviousResult = () => {
    if (!previousQuestion) {
      return <div className="previous-result none">Translate the word!</div>;
    }

    const questionText = mode === 'jp-to-en'
      ? `${previousQuestion.japanese} (${previousQuestion.romaji})`
      : previousQuestion.english;
    const rightAnswer = `${questionText} = ${previousCorrectAnswer}`;

    if (wasCorrect) {
      return (
        <div className="previous-result correct" title="Correct answer!">
          <span className="pull-left glyphicon glyphicon-none"></span>
          {rightAnswer}
          <span className="pull-right glyphicon glyphicon-ok"></span>
        </div>
      );
    } else {
      return (
        <div className="previous-result wrong" title="Wrong answer!">
          <span className="pull-left glyphicon glyphicon-none"></span>
          {rightAnswer}
          <span className="pull-right glyphicon glyphicon-remove"></span>
        </div>
      );
    }
  };

  // Start page - select translation direction
  if (!gameStarted) {
    return (
      <div className="text-center question col-xs-12">
        <div className="panel panel-default" style={{ marginTop: '40px', maxWidth: '400px', margin: '40px auto' }}>
          <div className="panel-heading">
            <h4 style={{ margin: 0 }}>Word Translation</h4>
          </div>
          <div className="panel-body">
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Choose your translation direction:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                className="btn btn-danger btn-lg"
                onClick={() => startGame('jp-to-en')}
                style={{ padding: '15px 30px' }}
              >
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>日本語 → English</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>See Japanese, type English</div>
              </button>
              <button
                className="btn btn-danger btn-lg"
                onClick={() => startGame('en-to-jp')}
                style={{ padding: '15px 30px' }}
              >
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>English → 日本語</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>See English, type Japanese/Romaji</div>
              </button>
            </div>
            <p style={{ marginTop: '20px', fontSize: '13px', color: '#999' }}>
              {questionCount} questions
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stageProgressPercentage = Math.round((stageProgress / questionCount) * 100) + '%';
  const stageProgressPercentageStyle = { width: stageProgressPercentage };

  return (
    <div className="text-center question col-xs-12">
      {getPreviousResult()}
      <div className="big-character" style={{ fontSize: mode === 'jp-to-en' ? '72px' : '32px' }}>
        {getShowableQuestion()}
      </div>
      <div className="answer-form-container" style={{ maxWidth: mode === 'en-to-jp' ? '200px' : '150px' }}>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            className="answer-input"
            type="text"
            value={currentAnswer}
            onChange={handleAnswerChange}
            style={{ width: mode === 'en-to-jp' ? '180px' : '140px' }}
          />
        </form>
      </div>
      <div style={{ marginTop: '8px' }}>
        <button className="btn btn-xs btn-default" onClick={handleSkip}>
          Skip
        </button>
      </div>
      {mode === 'jp-to-en' && (
        <div style={{ marginTop: '12px' }}>
          <label style={{ cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={showKanji}
              onChange={(e) => setShowKanji(e.target.checked)}
            />
            &nbsp;Show Kanji
          </label>
        </div>
      )}
      <div className="progress" style={{ marginTop: '16px' }}>
        <div
          className="progress-bar progress-bar-info"
          role="progressbar"
          aria-valuenow={stageProgress}
          aria-valuemin="0"
          aria-valuemax={questionCount}
          style={stageProgressPercentageStyle}
        >
          <span>{stageProgress}/{questionCount}</span>
        </div>
      </div>
    </div>
  );
};

export default WordTranslateQuestion;

