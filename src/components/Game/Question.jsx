import React, { useState, useEffect, useRef, useCallback } from 'react';
import { kanaDictionary } from '../../data/kanaDictionary';
import { findRomajisAtKanaKey, removeFromArray, arrayContains, shuffle, cartesianProduct } from '../../data/helperFuncs';
import './Question.scss';

const Question = ({ stage, decidedGroups, questionCount, handleStageComplete }) => {
  const [previousQuestion, setPreviousQuestion] = useState([]);
  const [previousAnswer, setPreviousAnswer] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState([]);
  const [answerOptions, setAnswerOptions] = useState([]);
  const [stageProgress, setStageProgress] = useState(0);
  const [results, setResults] = useState([]);

  // Use refs for mutable values that don't need to trigger re-renders
  const askableKanasRef = useRef({});
  const askableKanaKeysRef = useRef([]);
  const askableRomajisRef = useRef([]);
  const previousQuestionRef = useRef([]);
  const previousAllowedAnswersRef = useRef([]);
  const allowedAnswersRef = useRef([]);
  const currentQuestionRef = useRef([]);
  const stageProgressRef = useRef(0);
  const resultsRef = useRef([]);

  const initializeCharacters = useCallback(() => {
    const askableKanas = {};
    const askableKanaKeys = [];
    const askableRomajis = [];

    Object.keys(kanaDictionary).forEach(whichKana => {
      Object.keys(kanaDictionary[whichKana]).forEach(groupName => {
        if (arrayContains(groupName, decidedGroups)) {
          Object.assign(askableKanas, kanaDictionary[whichKana][groupName]['characters']);
          Object.keys(kanaDictionary[whichKana][groupName]['characters']).forEach(key => {
            askableKanaKeys.push(key);
            askableRomajis.push(kanaDictionary[whichKana][groupName]['characters'][key][0]);
          });
        }
      });
    });

    askableKanasRef.current = askableKanas;
    askableKanaKeysRef.current = askableKanaKeys;
    askableRomajisRef.current = askableRomajis;
    previousQuestionRef.current = [];
    stageProgressRef.current = 0;
    resultsRef.current = [];
  }, [decidedGroups]);

  const getRandomKanas = useCallback((amount, include, exclude) => {
    let randomizedKanas = askableKanaKeysRef.current.slice();

    if (exclude && exclude.length > 0) {
      randomizedKanas = removeFromArray(exclude, randomizedKanas);
    }

    if (include && include.length > 0) {
      randomizedKanas = removeFromArray(include, randomizedKanas);
      shuffle(randomizedKanas);
      randomizedKanas = randomizedKanas.slice(0, 20);

      let searchFor = findRomajisAtKanaKey(include, kanaDictionary)[0];
      randomizedKanas = randomizedKanas.filter(character => {
        return searchFor !== findRomajisAtKanaKey(character, kanaDictionary)[0];
      });

      let tempRandomizedKanas = randomizedKanas.slice();
      randomizedKanas = randomizedKanas.filter(r => {
        let dupeFound = false;
        searchFor = findRomajisAtKanaKey(r, kanaDictionary)[0];
        tempRandomizedKanas.shift();
        tempRandomizedKanas.forEach(w => {
          if (findRomajisAtKanaKey(w, kanaDictionary)[0] === searchFor)
            dupeFound = true;
        });
        return !dupeFound;
      });

      randomizedKanas = randomizedKanas.slice(0, amount - 1);
      randomizedKanas.push(include);
      shuffle(randomizedKanas);
    } else {
      shuffle(randomizedKanas);
      randomizedKanas = randomizedKanas.slice(0, amount);
    }
    return randomizedKanas;
  }, []);

  const setAllowedAnswers = useCallback((question) => {
    let allowed = [];
    if (stage === 1 || stage === 3)
      allowed = findRomajisAtKanaKey(question, kanaDictionary);
    else if (stage === 2)
      allowed = question;
    else if (stage === 4) {
      let tempAllowedAnswers = [];
      question.forEach(key => {
        tempAllowedAnswers.push(findRomajisAtKanaKey(key, kanaDictionary));
      });
      cartesianProduct(tempAllowedAnswers).forEach(answer => {
        allowed.push(answer.join(''));
      });
    }
    allowedAnswersRef.current = allowed;
  }, [stage]);

  const setNewQuestion = useCallback(() => {
    let newQuestion;
    if (stage !== 4)
      newQuestion = getRandomKanas(1, false, previousQuestionRef.current);
    else
      newQuestion = getRandomKanas(3, false, previousQuestionRef.current);

    currentQuestionRef.current = newQuestion;
    setCurrentQuestion(newQuestion);

    const newAnswerOptions = getRandomKanas(3, newQuestion[0], false);
    setAnswerOptions(newAnswerOptions);

    setAllowedAnswers(newQuestion);
  }, [stage, getRandomKanas, setAllowedAnswers]);

  const getAnswerType = () => {
    if (stage === 2) return 'kana';
    else return 'romaji';
  };

  const getShowableQuestion = () => {
    if (getAnswerType() === 'kana')
      return findRomajisAtKanaKey(currentQuestion, kanaDictionary)[0];
    else return currentQuestion;
  };

  const isInAllowedAnswers = (answer) => {
    return arrayContains(answer, previousAllowedAnswersRef.current);
  };

  const getPreviousResult = () => {
    let resultString = '';
    if (previousQuestion.length === 0)
      resultString = <div className="previous-result none">Let's go! Which character is this?</div>;
    else {
      let rightAnswer = (
        stage === 2 ?
          findRomajisAtKanaKey(previousQuestion, kanaDictionary)[0]
          : previousQuestion.join('')
      ) + ' = ' + previousAllowedAnswersRef.current[0];

      if (isInAllowedAnswers(previousAnswer))
        resultString = (
          <div className="previous-result correct" title="Correct answer!">
            <span className="pull-left glyphicon glyphicon-none"></span>{rightAnswer}<span className="pull-right glyphicon glyphicon-ok"></span>
          </div>
        );
      else
        resultString = (
          <div className="previous-result wrong" title="Wrong answer!">
            <span className="pull-left glyphicon glyphicon-none"></span>{rightAnswer}<span className="pull-right glyphicon glyphicon-remove"></span>
          </div>
        );
    }
    return resultString;
  };

  const handleAnswer = useCallback((answer) => {
    if (stage <= 2) document.activeElement.blur();

    previousQuestionRef.current = currentQuestionRef.current;
    setPreviousQuestion(currentQuestionRef.current);
    setPreviousAnswer(answer);
    previousAllowedAnswersRef.current = allowedAnswersRef.current;

    const isCorrect = arrayContains(answer, allowedAnswersRef.current);

    const questionDisplay = stage === 2
      ? findRomajisAtKanaKey(currentQuestionRef.current, kanaDictionary)[0]
      : currentQuestionRef.current.join('');
    const correctAnswerDisplay = allowedAnswersRef.current[0];

    const resultEntry = {
      question: questionDisplay,
      correctAnswer: correctAnswerDisplay,
      userAnswer: answer,
      correct: isCorrect
    };

    const newResults = [...resultsRef.current, resultEntry];
    resultsRef.current = newResults;
    setResults(newResults);

    if (isCorrect) {
      stageProgressRef.current = stageProgressRef.current + 1;
    }
    setStageProgress(stageProgressRef.current);

    if (stageProgressRef.current >= questionCount) {
      handleStageComplete(newResults);
    } else {
      setNewQuestion();
    }
  }, [stage, questionCount, handleStageComplete, setNewQuestion]);

  const handleAnswerChange = (e) => {
    setCurrentAnswer(e.target.value.replace(/\s+/g, ''));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentAnswer !== '') {
      handleAnswer(currentAnswer.toLowerCase());
      setCurrentAnswer('');
    }
  };

  useEffect(() => {
    initializeCharacters();
  }, [initializeCharacters]);

  useEffect(() => {
    if (askableKanaKeysRef.current.length > 0) {
      setNewQuestion();
    }
  }, []);

  let btnClass = "btn btn-default answer-button";
  if ('ontouchstart' in window)
    btnClass += " no-hover";

  let stageProgressPercentage = Math.round((stageProgress / questionCount) * 100) + '%';
  let stageProgressPercentageStyle = { width: stageProgressPercentage };

  return (
    <div className="text-center question col-xs-12">
      {getPreviousResult()}
      <div className="big-character">{getShowableQuestion()}</div>
      <div className="answer-container">
        {
          stage < 3 ?
            answerOptions.map((answer, idx) => {
              return <AnswerButton
                answer={answer}
                className={btnClass}
                key={idx}
                answertype={getAnswerType()}
                handleAnswer={handleAnswer}
              />;
            })
            : <div className="answer-form-container">
              <form onSubmit={handleSubmit}>
                <input autoFocus className="answer-input" type="text" value={currentAnswer} onChange={handleAnswerChange} />
              </form>
            </div>
        }
      </div>
      <div className="progress">
        <div className="progress-bar progress-bar-info"
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

const AnswerButton = ({ answer, className, answertype, handleAnswer }) => {
  const getShowableAnswer = () => {
    if (answertype === 'romaji')
      return findRomajisAtKanaKey(answer, kanaDictionary)[0];
    else return answer;
  };

  return (
    <button className={className} onClick={() => handleAnswer(getShowableAnswer())}>{getShowableAnswer()}</button>
  );
};

export default Question;
