import React, { useState, useEffect, useCallback } from 'react';
import { getCustomWords, addCustomWord, removeCustomWord, getWordDictionary, baseWordDictionary, addAllBaseWordsAsCustom, removeAllBaseWordsFromCustom } from '../../data/wordDictionary';
import './ChooseCharacters.scss';

const CustomWordEditor = () => {
  const [customWords, setCustomWords] = useState([]);
  const [japanese, setJapanese] = useState('');
  const [romaji, setRomaji] = useState('');
  const [english, setEnglish] = useState('');
  const [kanji, setKanji] = useState('');
  const [error, setError] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [showFullExport, setShowFullExport] = useState(false);
  const [showBaseWords, setShowBaseWords] = useState(false);
  const [baseWordFilter, setBaseWordFilter] = useState('');
  const [customWordFilter, setCustomWordFilter] = useState('');

  const loadCustomWords = useCallback(() => {
    const words = getCustomWords();
    setCustomWords(words);
  }, []);

  useEffect(() => {
    loadCustomWords();
  }, [loadCustomWords]);

  const handleInputChange = (field) => (e) => {
    setError('');
    switch (field) {
      case 'japanese':
        setJapanese(e.target.value);
        break;
      case 'romaji':
        setRomaji(e.target.value);
        break;
      case 'english':
        setEnglish(e.target.value);
        break;
      case 'kanji':
        setKanji(e.target.value);
        break;
      default:
        break;
    }
  };

  const handleAddWord = (e) => {
    e.preventDefault();

    // Validation
    if (!japanese.trim() || !romaji.trim() || !english.trim()) {
      setError('Japanese, Romaji, and English are required!');
      return;
    }

    const newWord = {
      japanese: japanese.trim(),
      romaji: romaji.trim().toLowerCase(),
      english: english.trim().toLowerCase()
    };

    if (kanji.trim()) {
      newWord.kanji = kanji.trim();
    }

    addCustomWord(newWord);
    setJapanese('');
    setRomaji('');
    setEnglish('');
    setKanji('');
    setError('');
    loadCustomWords();
  };

  const handleRemoveWord = (index) => {
    removeCustomWord(index);
    loadCustomWords();
  };

  const toggleExport = () => {
    setShowExport(prev => !prev);
  };

  const toggleFullExport = () => {
    setShowFullExport(prev => !prev);
  };

  const toggleBaseWords = () => {
    setShowBaseWords(prev => !prev);
    setBaseWordFilter('');
  };

  const handleBaseWordFilterChange = (e) => {
    setBaseWordFilter(e.target.value);
  };

  const handleCustomWordFilterChange = (e) => {
    setCustomWordFilter(e.target.value);
  };

  const getFilteredCustomWords = () => {
    if (!customWordFilter.trim()) return customWords;

    const filter = customWordFilter.toLowerCase().trim();
    return customWords.filter(word =>
      word.japanese.includes(filter) ||
      word.romaji.toLowerCase().includes(filter) ||
      word.english.toLowerCase().includes(filter) ||
      (word.kanji && word.kanji.includes(filter))
    );
  };

  const copyWordToForm = (word) => {
    setJapanese(word.japanese);
    setRomaji(word.romaji);
    setEnglish(word.english);
    setKanji(word.kanji || '');
    setError('');
  };

  const handleAddAllBaseWords = () => {
    addAllBaseWordsAsCustom();
    loadCustomWords();
  };

  const handleRemoveAllBaseWords = () => {
    removeAllBaseWordsFromCustom();
    loadCustomWords();
  };

  // Check how many base words are currently in custom words
  const getBaseWordsInCustomCount = () => {
    const baseJapaneseSet = new Set(baseWordDictionary.map(w => w.japanese));
    return customWords.filter(w => baseJapaneseSet.has(w.japanese)).length;
  };

  const getFilteredBaseWords = () => {
    if (!baseWordFilter.trim()) return baseWordDictionary;

    const filter = baseWordFilter.toLowerCase().trim();
    return baseWordDictionary.filter(word =>
      word.japanese.includes(filter) ||
      word.romaji.toLowerCase().includes(filter) ||
      word.english.toLowerCase().includes(filter) ||
      (word.kanji && word.kanji.includes(filter))
    );
  };

  const generateFullDictionaryCode = () => {
    const fullDictionary = getWordDictionary();
    if (fullDictionary.length === 0) return '// No words in dictionary';

    const lines = fullDictionary.map(word => {
      if (word.kanji) {
        return `  { japanese: '${word.japanese}', romaji: '${word.romaji}', english: '${word.english}', kanji: '${word.kanji}' },`;
      } else {
        return `  { japanese: '${word.japanese}', romaji: '${word.romaji}', english: '${word.english}' },`;
      }
    });

    return `export const wordDictionary = [\n${lines.join('\n')}\n];`;
  };

  const copyFullDictionaryToClipboard = () => {
    const exportCode = generateFullDictionaryCode();
    navigator.clipboard.writeText(exportCode).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const generateExportCode = () => {
    if (customWords.length === 0) return '// No custom words to export';

    const lines = customWords.map(word => {
      if (word.kanji) {
        return `  { japanese: '${word.japanese}', romaji: '${word.romaji}', english: '${word.english}', kanji: '${word.kanji}' },`;
      } else {
        return `  { japanese: '${word.japanese}', romaji: '${word.romaji}', english: '${word.english}' },`;
      }
    });

    return lines.join('\n');
  };

  const copyToClipboard = () => {
    const exportCode = generateExportCode();
    navigator.clipboard.writeText(exportCode).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className="panel panel-default" style={{ marginTop: '15px', marginBottom: '200px' }}>
      <div className="panel-heading">
        <strong>Custom Words</strong>
        <span style={{ float: 'right' }}>
          {customWords.length} word{customWords.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="panel-body">
        {/* Browse Base Words Section */}
        <div style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <button
            className="btn btn-sm btn-default"
            onClick={toggleBaseWords}
          >
            {showBaseWords ? 'Hide Base Words' : 'Browse Base Words'} ({baseWordDictionary.length} words)
          </button>
          {' '}
          <button
            className="btn btn-sm btn-info"
            onClick={handleAddAllBaseWords}
            title="Add all base words as custom words so you can edit them"
          >
            Add All Base Words to Editor
          </button>
          {' '}
          {getBaseWordsInCustomCount() > 0 && (
            <button
              className="btn btn-sm btn-warning"
              onClick={handleRemoveAllBaseWords}
              title="Remove base words from custom list (keeps your own custom words)"
            >
              Remove Base Words from Editor ({getBaseWordsInCustomCount()})
            </button>
          )}

          {showBaseWords && (
            <div style={{ marginTop: '10px' }}>
              <p className="text-muted" style={{ fontSize: '12px', marginBottom: '8px' }}>
                Click on a word to copy it to the form above for editing. Add it as a custom word to override the original.
              </p>
              <input
                type="text"
                className="form-control"
                placeholder="Search words..."
                value={baseWordFilter}
                onChange={handleBaseWordFilterChange}
                style={{ marginBottom: '10px' }}
              />
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <table className="table table-condensed table-hover" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Japanese</th>
                      <th>Romaji</th>
                      <th>English</th>
                      <th>Kanji</th>
                      <th style={{ width: '80px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredBaseWords().map((word, idx) => (
                      <tr key={idx}>
                        <td>{word.japanese}</td>
                        <td>{word.romaji}</td>
                        <td>{word.english}</td>
                        <td>{word.kanji || '-'}</td>
                        <td>
                          <button
                            className="btn btn-xs btn-primary"
                            onClick={() => copyWordToForm(word)}
                            title="Copy to form for editing"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredBaseWords().length === 0 && (
                  <p className="text-muted text-center" style={{ padding: '10px' }}>
                    No words match your search.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add new word form */}
        <form onSubmit={handleAddWord} style={{ marginBottom: '15px' }}>
          <div className="row">
            <div className="col-sm-3 col-xs-6" style={{ marginBottom: '8px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Japanese (kana)"
                value={japanese}
                onChange={handleInputChange('japanese')}
              />
            </div>
            <div className="col-sm-2 col-xs-6" style={{ marginBottom: '8px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Romaji"
                value={romaji}
                onChange={handleInputChange('romaji')}
              />
            </div>
            <div className="col-sm-3 col-xs-6" style={{ marginBottom: '8px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="English"
                value={english}
                onChange={handleInputChange('english')}
              />
            </div>
            <div className="col-sm-2 col-xs-6" style={{ marginBottom: '8px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Kanji (optional)"
                value={kanji}
                onChange={handleInputChange('kanji')}
              />
            </div>
            <div className="col-sm-2 col-xs-12" style={{ marginBottom: '8px' }}>
              <button type="submit" className="btn btn-success btn-block">
                Add Word
              </button>
            </div>
          </div>
          {error && <div className="text-danger" style={{ marginTop: '5px' }}>{error}</div>}
        </form>

        {/* List of custom words */}
        {customWords.length > 0 ? (
          <div>
            <input
              type="text"
              className="form-control"
              placeholder="Search custom words..."
              value={customWordFilter}
              onChange={handleCustomWordFilterChange}
              style={{ marginBottom: '10px' }}
            />
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table className="table table-condensed table-hover" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th>Japanese</th>
                    <th>Romaji</th>
                    <th>English</th>
                    <th>Kanji</th>
                    <th style={{ width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredCustomWords().map((word) => {
                    const realIndex = customWords.indexOf(word);
                    return (
                      <tr key={realIndex}>
                        <td>{word.japanese}</td>
                        <td>{word.romaji}</td>
                        <td>{word.english}</td>
                        <td>{word.kanji || '-'}</td>
                        <td>
                          <button
                            className="btn btn-xs btn-danger"
                            onClick={() => handleRemoveWord(realIndex)}
                            title="Remove word"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {getFilteredCustomWords().length === 0 && (
                <p className="text-muted text-center" style={{ padding: '10px' }}>
                  No words match your search.
                </p>
              )}
            </div>

            {/* Export section */}
            <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <button
                className="btn btn-sm btn-default"
                onClick={toggleExport}
              >
                {showExport ? 'Hide Export' : 'Export for wordDictionary.js'}
              </button>

              {showExport && (
                <div style={{ marginTop: '10px' }}>
                  <p className="text-muted" style={{ fontSize: '12px', marginBottom: '5px' }}>
                    Copy and paste this code into wordDictionary.js:
                  </p>
                  <textarea
                    className="form-control"
                    readOnly
                    value={generateExportCode()}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      height: '120px',
                      resize: 'vertical'
                    }}
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ marginTop: '8px' }}
                    onClick={copyToClipboard}
                  >
                    Copy to Clipboard
                  </button>
                </div>
              )}

              {/* Full Dictionary Export */}
              <button
                className="btn btn-sm btn-info"
                style={{ marginLeft: '10px' }}
                onClick={toggleFullExport}
              >
                {showFullExport ? 'Hide Full Dictionary' : 'Export Full Dictionary'}
              </button>

              {showFullExport && (
                <div style={{ marginTop: '10px' }}>
                  <p className="text-muted" style={{ fontSize: '12px', marginBottom: '5px' }}>
                    Full word dictionary (base words + custom words):
                  </p>
                  <textarea
                    className="form-control"
                    readOnly
                    value={generateFullDictionaryCode()}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      height: '200px',
                      resize: 'vertical'
                    }}
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ marginTop: '8px' }}
                    onClick={copyFullDictionaryToClipboard}
                  >
                    Copy Full Dictionary to Clipboard
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted text-center" style={{ marginBottom: 0 }}>
            No custom words yet. Add some above to practice them in the Word Translation game!
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomWordEditor;

