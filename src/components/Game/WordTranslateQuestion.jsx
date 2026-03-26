import React, { Component } from 'react';
import { getWordDictionary } from '../../data/wordDictionary';
import { shuffle } from '../../data/helperFuncs';
import './Question.scss';

/*
Stage 6: Word Translation Game
- Shows a Japanese word (in kana) and asks for the English translation
- Text input field for typing the answer
- Progress bar similar to other stages
*/

class WordTranslateQuestion extends Component {
  state = {
    previousQuestion: null,
    previousAnswer: '',
    previousCorrectAnswer: '',
    wasCorrect: null,
    currentQuestion: null,
    currentAnswer: '',
    stageProgress: 0,
    mode: 'jp-to-en', // 'jp-to-en' or 'en-to-jp'
    showKanji: false, // Toggle to show kanji instead of kana
    results: [] // Track all answers for summary
  }

  componentWillMount() {
    this.availableWords = getWordDictionary(); // Includes base + custom words
    this.completedWords = []; // Track correctly answered words
    this.previousQuestion = null;
    this.stageProgress = 0;
  }

  componentDidMount() {
    this.setNewQuestion();
  }

  getRandomWords(amount, exclude) {
    // Filter out completed words
    let words = this.availableWords.filter(w => !this.completedWords.includes(w));

    // If all words have been completed, reset the pool
    if (words.length === 0) {
      this.completedWords = [];
      words = this.availableWords.slice();
    }

    if (exclude) {
      words = words.filter(w => w !== exclude);
    }
    shuffle(words);
    return words.slice(0, amount);
  }

  setNewQuestion() {
    // Get a random word, excluding the previous one
    const candidates = this.getRandomWords(1, this.previousQuestion);
    const question = candidates[0];

    this.currentQuestion = question;
    this.setState({
      currentQuestion: question
    });
  }

  handleAnswer = (answer) => {
    const answerTrimmed = answer.trim().toLowerCase();
    const word = this.currentQuestion;

    let isCorrect = false;
    let allowedAnswers = [];

    if (this.state.mode === 'jp-to-en') {
      // Displaying Japanese -> accept English or romaji
      allowedAnswers = [word.english.toLowerCase(), word.romaji.toLowerCase()];
      isCorrect = allowedAnswers.includes(answerTrimmed);
    } else {
      // Displaying English -> accept Japanese, romaji, or kanji (if available)
      allowedAnswers = [word.japanese, word.romaji.toLowerCase()];
      if (word.kanji) {
        allowedAnswers.push(word.kanji);
      }
      isCorrect = answerTrimmed === word.japanese ||
                  answerTrimmed === word.romaji.toLowerCase() ||
                  (word.kanji && answer.trim() === word.kanji);
    }

    this.previousQuestion = this.currentQuestion;
    this.previousAllowedAnswers = allowedAnswers;

    // Build the correct answer display string
    let correctAnswerDisplay;
    if (this.state.mode === 'jp-to-en') {
      correctAnswerDisplay = `${word.english} / ${word.romaji}`;
    } else {
      correctAnswerDisplay = word.kanji
        ? `${word.japanese} / ${word.kanji} / ${word.romaji}`
        : `${word.japanese} / ${word.romaji}`;
    }

    // Build result entry for summary
    const questionDisplay = this.state.mode === 'jp-to-en'
      ? `${word.japanese} (${word.romaji})`
      : word.english;

    const resultEntry = {
      question: questionDisplay,
      correctAnswer: correctAnswerDisplay,
      userAnswer: answer,
      correct: isCorrect
    };

    const newResults = [...this.state.results, resultEntry];

    this.setState({
      previousQuestion: this.previousQuestion,
      previousAnswer: answer,
      previousCorrectAnswer: correctAnswerDisplay,
      wasCorrect: isCorrect,
      results: newResults
    });

    if (isCorrect) {
      this.stageProgress = this.stageProgress + 1;
      // Add to completed words so it won't be asked again
      if (!this.completedWords.includes(this.currentQuestion)) {
        this.completedWords.push(this.currentQuestion);
      }
    }
    // Wrong answers don't reduce progress - user just needs X correct total
    this.setState({ stageProgress: this.stageProgress });

    if (this.stageProgress >= this.props.questionCount) {
      this.props.handleStageComplete(newResults);
    } else {
      this.setNewQuestion();
    }
  }

  handleAnswerChange = (e) => {
    this.setState({ currentAnswer: e.target.value });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.currentAnswer !== '') {
      this.handleAnswer(this.state.currentAnswer);
      this.setState({ currentAnswer: '' });
    }
  }

  toggleMode = () => {
    this.setState(
      prevState => ({ mode: prevState.mode === 'jp-to-en' ? 'en-to-jp' : 'jp-to-en', currentAnswer: '' }),
      () => this.setNewQuestion()
    );
  }

  toggleKanji = () => {
    this.setState(prevState => ({ showKanji: !prevState.showKanji }));
  }

  getShowableQuestion() {
    if (!this.state.currentQuestion) return '';
    if (this.state.mode === 'jp-to-en') {
      // Show kanji if enabled and available, otherwise show kana
      if (this.state.showKanji && this.state.currentQuestion.kanji) {
        return this.state.currentQuestion.kanji;
      }
      return this.state.currentQuestion.japanese;
    } else {
      return this.state.currentQuestion.english;
    }
  }

  getPreviousResult() {
    if (!this.state.previousQuestion) {
      return <div className="previous-result none">Translate the word!</div>;
    }

    const { previousQuestion, previousCorrectAnswer, wasCorrect } = this.state;
    const questionText = this.state.mode === 'jp-to-en'
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
  }

  render() {
    const stageProgressPercentage = Math.round((this.state.stageProgress / this.props.questionCount) * 100) + '%';
    const stageProgressPercentageStyle = { width: stageProgressPercentage };

    return (
      <div className="text-center question col-xs-12">
        {this.getPreviousResult()}
        <div className="big-character" style={{ fontSize: this.state.mode === 'jp-to-en' ? '72px' : '32px' }}>
          {this.getShowableQuestion()}
        </div>
        <div className="answer-form-container" style={{ maxWidth: this.state.mode === 'en-to-jp' ? '200px' : '150px' }}>
          <form onSubmit={this.handleSubmit}>
            <input
              autoFocus
              className="answer-input"
              type="text"
              value={this.state.currentAnswer}
              onChange={this.handleAnswerChange}
              style={{ width: this.state.mode === 'en-to-jp' ? '180px' : '140px' }}
            />
          </form>
        </div>
        <div style={{ marginTop: '12px' }}>
          <button className="btn btn-xs btn-default" onClick={this.toggleMode}>
            {this.state.mode === 'jp-to-en' ? 'Switch to: English → Japanese' : 'Switch to: Japanese → English'}
          </button>
          {this.state.mode === 'jp-to-en' && (
            <button className="btn btn-xs btn-default" style={{ marginLeft: '8px' }} onClick={this.toggleKanji}>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={this.state.showKanji ? {} : { visibility: 'hidden', height: 0, overflow: 'hidden' }}>Show: Kana</span>
                <span style={this.state.showKanji ? { visibility: 'hidden', height: 0, overflow: 'hidden' } : {}}>Show: Kanji</span>
              </span>
            </button>
          )}
        </div>
        <div className="progress" style={{ marginTop: '16px' }}>
          <div
            className="progress-bar progress-bar-info"
            role="progressbar"
            aria-valuenow={this.state.stageProgress}
            aria-valuemin="0"
            aria-valuemax={this.props.questionCount}
            style={stageProgressPercentageStyle}
          >
            <span>{this.state.stageProgress}/{this.props.questionCount}</span>
          </div>
        </div>
      </div>
    );
  }
}

export default WordTranslateQuestion;





