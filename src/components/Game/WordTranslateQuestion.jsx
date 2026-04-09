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
  const [previousQuestion, setPreviousQuestion] = useState(null);
  const [previousAnswer, setPreviousAnswer] = useState('');
  const [previousCorrectAnswer, setPreviousCorrectAnswer] = useState('');
  const [wasCorrect, setWasCorrect] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [stageProgress, setStageProgress] = useState(0);
  const [mode, setMode] = useState('jp-to-en');
  const [showKanji, setShowKanji] = useState(false);
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

  useEffect(() => {
    if (availableWordsRef.current.length > 0 || true) {
      // Initialize on mount
      availableWordsRef.current = getWordDictionary();
      setNewQuestion();
    }
  }, []);

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
      correctAnswerDisplay = `${word.english} / ${word.romaji}`;
    } else {
      correctAnswerDisplay = word.kanji
        ? `${word.japanese} / ${word.kanji} / ${word.romaji}`
        : `${word.japanese} / ${word.romaji}`;
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

  const toggleMode = () => {
    setMode(prevMode => {
      const newMode = prevMode === 'jp-to-en' ? 'en-to-jp' : 'jp-to-en';
      setCurrentAnswer('');
      setTimeout(() => setNewQuestion(), 0);
      return newMode;
    });
  };

  const toggleKanji = () => {
    setShowKanji(prev => !prev);
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
      <div style={{ marginTop: '12px' }}>
        <button className="btn btn-xs btn-default" onClick={toggleMode}>
          {mode === 'jp-to-en' ? 'Switch to: English → Japanese' : 'Switch to: Japanese → English'}
        </button>
        {mode === 'jp-to-en' && (
          <button className="btn btn-xs btn-default" style={{ marginLeft: '8px' }} onClick={toggleKanji}>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={showKanji ? {} : { visibility: 'hidden', height: 0, overflow: 'hidden' }}>Show: Kana</span>
              <span style={showKanji ? { visibility: 'hidden', height: 0, overflow: 'hidden' } : {}}>Show: Kanji</span>
            </span>
          </button>
        )}
      </div>
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

