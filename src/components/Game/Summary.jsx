import React from 'react';
import './Question.scss';

const Summary = ({ results, onBackToMenu }) => {
  const correctCount = results.filter(r => r.correct).length;
  const wrongCount = results.filter(r => !r.correct).length;
  const totalCount = results.length;
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // Separate correct and wrong answers
  const correctAnswers = results.filter(r => r.correct);
  const wrongAnswers = results.filter(r => !r.correct);

  return (
    <div className="text-center question col-xs-12 summary-screen">
      <div className="panel panel-default" style={{ marginTop: '20px' }}>
        <div className="panel-body">
          <h2>Session Complete!</h2>
          <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0' }}>
            {percentage}% accuracy
          </div>
          <p style={{ fontSize: '18px', color: '#666' }}>
            <span style={{ color: '#5cb85c' }}>{correctCount} correct</span>
            {' · '}
            <span style={{ color: '#d9534f' }}>{wrongCount} wrong</span>
            {' · '}
            {totalCount} total
          </p>
        </div>
      </div>

      {wrongAnswers.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading" style={{ backgroundColor: '#f2dede', color: '#a94442' }}>
            <strong>Needs Practice ({wrongAnswers.length})</strong>
          </div>
          <div className="panel-body" style={{ textAlign: 'left', maxHeight: '200px', overflowY: 'auto' }}>
            {wrongAnswers.map((item, idx) => (
              <div key={idx} style={{ padding: '6px 0', borderBottom: idx < wrongAnswers.length - 1 ? '1px solid #eee' : 'none' }}>
                <span style={{ fontSize: '1.2em' }}>{item.question}</span>
                <span style={{ color: '#999', margin: '0 8px' }}>→</span>
                <span style={{ color: '#5cb85c' }}>{item.correctAnswer}</span>
                {item.userAnswer && (
                  <span style={{ color: '#d9534f', marginLeft: '8px' }}>
                    (you: {item.userAnswer})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {correctAnswers.length > 0 && (
        <div className="panel panel-default">
          <div className="panel-heading" style={{ backgroundColor: '#dff0d8', color: '#3c763d' }}>
            <strong>Correct ({correctAnswers.length})</strong>
          </div>
          <div className="panel-body" style={{ textAlign: 'left', maxHeight: '200px', overflowY: 'auto' }}>
            {correctAnswers.map((item, idx) => (
              <div key={idx} style={{ padding: '6px 0', borderBottom: idx < correctAnswers.length - 1 ? '1px solid #eee' : 'none' }}>
                <span style={{ fontSize: '1.2em' }}>{item.question}</span>
                <span style={{ color: '#999', margin: '0 8px' }}>→</span>
                <span style={{ color: '#5cb85c' }}>{item.correctAnswer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        className="btn btn-danger"
        style={{ marginTop: '20px', marginBottom: '20px', padding: '12px 40px', fontSize: '16px' }}
        onClick={onBackToMenu}
      >
        Back to Menu
      </button>
    </div>
  );
};

export default Summary;

