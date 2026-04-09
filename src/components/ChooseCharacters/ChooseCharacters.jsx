import React, { useState, useEffect, useRef, useCallback } from 'react';
import { kanaDictionary } from '../../data/kanaDictionary';
import './ChooseCharacters.scss';
import CharacterGroup from './CharacterGroup';
import CustomWordEditor from './CustomWordEditor';

// Build a lookup: for each kana character + whichKana section, find the custom key
function buildCharToCustomKey() {
  const map = {};
  const custom = kanaDictionary.custom || {};
  Object.keys(custom).forEach(customKey => {
    const chars = custom[customKey].characters;
    Object.keys(chars).forEach(kana => {
      // Determine which section this belongs to
      if (customKey.startsWith('c_h_')) {
        map['hiragana_' + kana] = customKey;
      } else if (customKey.startsWith('c_k_')) {
        map['katakana_' + kana] = customKey;
      }
    });
  });
  return map;
}

const charToCustomKey = buildCharToCustomKey();

// Migrate old group-based selections to individual character keys
function migrateSelections(selectedGroups) {
  const migrated = [];
  const seen = new Set();
  selectedGroups.forEach(groupName => {
    // Already a custom per-char key — keep it
    if (groupName.startsWith('c_h_') || groupName.startsWith('c_k_')) {
      if (!seen.has(groupName)) {
        migrated.push(groupName);
        seen.add(groupName);
      }
      return;
    }
    // Old group key like h_group1 or k_group2_a — expand to individual keys
    let whichKana = null;
    if (groupName.startsWith('h_')) whichKana = 'hiragana';
    else if (groupName.startsWith('k_')) whichKana = 'katakana';
    if (whichKana && kanaDictionary[whichKana][groupName]) {
      const chars = kanaDictionary[whichKana][groupName].characters;
      Object.keys(chars).forEach(kana => {
        const customKey = charToCustomKey[whichKana + '_' + kana];
        if (customKey && !seen.has(customKey)) {
          migrated.push(customKey);
          seen.add(customKey);
        }
      });
    }
  });
  return migrated;
}

// Get all custom keys for characters in a group
function getCustomKeysForGroup(whichKana, groupName) {
  const group = kanaDictionary[whichKana][groupName];
  if (!group) return [];
  const keys = [];
  Object.keys(group.characters).forEach(kana => {
    const customKey = charToCustomKey[whichKana + '_' + kana];
    if (customKey) keys.push(customKey);
  });
  return keys;
}

const stageDescriptions = [
  { stage: 1, title: 'Choose One', description: 'Pick the correct romaji' },
  { stage: 2, title: 'Reverse', description: 'Pick the correct kana' },
  { stage: 3, title: 'Write', description: 'Type the romaji answer' },
  { stage: 4, title: 'Three at Once', description: 'Type three characters' },
  { stage: 5, title: 'Draw', description: 'Draw the character' },
  { stage: 6, title: 'Word Translation', description: 'Translate words' }
];

const ChooseCharacters = ({ selectedGroups: initialSelectedGroups, handleStartGame }) => {
  const [errMsg, setErrMsg] = useState('');
  const [selectedGroups, setSelectedGroups] = useState(migrateSelections(initialSelectedGroups || []));
  const [showAlternatives, setShowAlternatives] = useState([]);
  const [showSimilars, setShowSimilars] = useState([]);
  const [startIsVisible, setStartIsVisible] = useState(true);
  const [questionCount, setQuestionCount] = useState(15);

  const startRef = useRef(null);

  const testIsStartVisible = useCallback(() => {
    if (startRef.current) {
      const rect = startRef.current.getBoundingClientRect();
      if (rect.y > window.innerHeight && startIsVisible)
        setStartIsVisible(false);
      else if (rect.y <= window.innerHeight && !startIsVisible)
        setStartIsVisible(true);
    }
  }, [startIsVisible]);

  useEffect(() => {
    testIsStartVisible();
    window.addEventListener('resize', testIsStartVisible);
    window.addEventListener('scroll', testIsStartVisible);

    return () => {
      window.removeEventListener('resize', testIsStartVisible);
      window.removeEventListener('scroll', testIsStartVisible);
    };
  }, [testIsStartVisible]);

  useEffect(() => {
    testIsStartVisible();
  });

  const scrollToStart = () => {
    if (startRef.current) {
      const rect = startRef.current.getBoundingClientRect();
      const absTop = rect.top + window.pageYOffset;
      const scrollPos = absTop - window.innerHeight + 50;
      window.scrollTo(0, scrollPos > 0 ? scrollPos : 0);
    }
  };

  // Build a Set of selected kana characters for quick lookup
  const getSelectedCharsSet = () => {
    const set = new Set();
    const custom = kanaDictionary.custom || {};
    selectedGroups.forEach(key => {
      if (custom[key]) {
        Object.keys(custom[key].characters).forEach(kana => set.add(kana));
      }
    });
    return set;
  };

  const getIndex = (groupName) => {
    return selectedGroups.indexOf(groupName);
  };

  const isSelected = (groupName) => {
    return getIndex(groupName) > -1;
  };

  // Toggle an entire group: add or remove all individual character keys for that group
  const toggleSelect = (groupName) => {
    // Find which kana section this group belongs to
    let whichKana = null;
    if (groupName.startsWith('h_')) whichKana = 'hiragana';
    else if (groupName.startsWith('k_')) whichKana = 'katakana';
    else if (groupName.startsWith('c_')) {
      // Direct custom key toggle (for custom section)
      if (isSelected(groupName)) {
        const newGroups = selectedGroups.filter(g => g !== groupName);
        setSelectedGroups(newGroups);
      } else {
        setErrMsg('');
        setSelectedGroups([...selectedGroups, groupName]);
      }
      return;
    }

    if (!whichKana) return;

    const customKeys = getCustomKeysForGroup(whichKana, groupName);
    const selectedSet = new Set(selectedGroups);

    // Check if all chars in this group are currently selected
    const allSelected = customKeys.every(k => selectedSet.has(k));

    let newGroups;
    if (allSelected) {
      // Deselect all chars in this group
      const removeSet = new Set(customKeys);
      newGroups = selectedGroups.filter(g => !removeSet.has(g));
    } else {
      // Select all chars in this group
      newGroups = selectedGroups.slice();
      customKeys.forEach(k => {
        if (!selectedSet.has(k)) {
          newGroups.push(k);
        }
      });
    }
    setErrMsg('');
    setSelectedGroups(newGroups);
  };

  // Toggle an individual character
  const toggleChar = (kana, whichKana) => {
    const customKey = charToCustomKey[whichKana + '_' + kana];
    if (!customKey) return;

    const selectedSet = new Set(selectedGroups);
    let newGroups;
    if (selectedSet.has(customKey)) {
      newGroups = selectedGroups.filter(g => g !== customKey);
    } else {
      newGroups = [...selectedGroups, customKey];
    }
    setErrMsg('');
    setSelectedGroups(newGroups);
  };

  const selectAll = (whichKana, altOnly = false, similarOnly = false) => {
    const thisKana = kanaDictionary[whichKana];
    const selectedSet = new Set(selectedGroups);
    let newSelectedGroups = selectedGroups.slice();

    Object.keys(thisKana).forEach(groupName => {
      const matchesFilter =
        (altOnly && groupName.endsWith('_a')) ||
        (similarOnly && groupName.endsWith('_s')) ||
        (!altOnly && !similarOnly);

      if (matchesFilter) {
        const customKeys = getCustomKeysForGroup(whichKana, groupName);
        customKeys.forEach(k => {
          if (!selectedSet.has(k)) {
            newSelectedGroups.push(k);
            selectedSet.add(k);
          }
        });
      }
    });
    setErrMsg('');
    setSelectedGroups(newSelectedGroups);
  };

  const selectNone = (whichKana, altOnly = false, similarOnly = false) => {
    const thisKana = kanaDictionary[whichKana];
    const removeSet = new Set();

    Object.keys(thisKana).forEach(groupName => {
      const matchesFilter =
        (altOnly && groupName.endsWith('_a')) ||
        (similarOnly && groupName.endsWith('_s')) ||
        (!altOnly && !similarOnly);

      if (matchesFilter) {
        getCustomKeysForGroup(whichKana, groupName).forEach(k => removeSet.add(k));
      }
    });

    const newSelectedGroups = selectedGroups.filter(g => !removeSet.has(g));
    setSelectedGroups(newSelectedGroups);
  };

  const toggleAlternative = (whichKana, postfix) => {
    if (postfix === '_a') {
      const idx = showAlternatives.indexOf(whichKana);
      if (idx >= 0) {
        setShowAlternatives(showAlternatives.filter((_, i) => i !== idx));
      } else {
        setShowAlternatives([...showAlternatives, whichKana]);
      }
    }
    if (postfix === '_s') {
      const idx = showSimilars.indexOf(whichKana);
      if (idx >= 0) {
        setShowSimilars(showSimilars.filter((_, i) => i !== idx));
      } else {
        setShowSimilars([...showSimilars, whichKana]);
      }
    }
  };

  const getSelectedAlternatives = (whichKana, postfix) => {
    const thisKana = kanaDictionary[whichKana];
    const selectedSet = new Set(selectedGroups);
    let total = 0;
    let selected = 0;
    Object.keys(thisKana).forEach(groupName => {
      if (groupName.endsWith(postfix)) {
        const customKeys = getCustomKeysForGroup(whichKana, groupName);
        total += customKeys.length;
        customKeys.forEach(k => { if (selectedSet.has(k)) selected++; });
      }
    });
    return { total, selected };
  };

  const alternativeToggleRow = (whichKana, postfix, show) => {
    const { total, selected } = getSelectedAlternatives(whichKana, postfix);
    let checkBtn = "glyphicon glyphicon-small glyphicon-";
    let status;
    if (selected >= total && total > 0)
      status = 'check';
    else if (selected > 0)
      status = 'check half';
    else
      status = 'unchecked';
    checkBtn += status;

    return (
      <div
        key={'alt_toggle_' + whichKana + postfix}
        onClick={() => toggleAlternative(whichKana, postfix)}
        className="choose-row"
      >
        <span
          className={checkBtn}
          onClick={e => {
            if (status === 'check')
              selectNone(whichKana, postfix === '_a', postfix === '_s');
            else if (status === 'check half' || status === 'unchecked')
              selectAll(whichKana, postfix === '_a', postfix === '_s');
            e.stopPropagation();
          }}
        ></span>
        {
          show ? <span className="toggle-caret">&#9650;</span>
            : <span className="toggle-caret">&#9660;</span>
        }
        {
          postfix === '_a' ? 'Alternative characters (ga · ba · kya..)' :
            'Look-alike characters'
        }
      </div>
    );
  };

  // Check group selection state based on individual character keys
  const getGroupSelectionState = (whichKana, groupName) => {
    const customKeys = getCustomKeysForGroup(whichKana, groupName);
    const selectedSet = new Set(selectedGroups);
    const selectedCount = customKeys.filter(k => selectedSet.has(k)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === customKeys.length) return 'all';
    return 'partial';
  };

  const showGroupRows = (whichKana, showAlternativesFlag, showSimilarsFlag = false, showAll = false) => {
    const thisKana = kanaDictionary[whichKana];
    const selectedChars = getSelectedCharsSet();
    let rows = [];
    Object.keys(thisKana).forEach((groupName, idx) => {
      if (groupName === "h_group11_a" || groupName === "k_group13_a")
        rows.push(alternativeToggleRow(whichKana, "_a", showAlternativesFlag));
      if (groupName === "k_group11_s")
        rows.push(alternativeToggleRow(whichKana, "_s", showSimilarsFlag));

      if (showAll || ((!groupName.endsWith("a") || showAlternativesFlag) &&
        (!groupName.endsWith("s") || showSimilarsFlag))) {

        const selState = getGroupSelectionState(whichKana, groupName);
        rows.push(
          <CharacterGroup
            key={idx}
            groupName={groupName}
            selected={selState === 'all'}
            selectedChars={selectedChars}
            characters={thisKana[groupName].characters}
            handleToggleSelect={toggleSelect}
            handleToggleChar={toggleChar}
            whichKana={whichKana}
          />
        );
      }
    });

    return rows;
  };

  const startGame = (stage) => {
    if (stage !== 6 && selectedGroups.length < 1) {
      setErrMsg('Choose at least one character!');
      return;
    }
    const count = Math.max(1, parseInt(questionCount, 10) || 15);
    handleStartGame(selectedGroups, stage, count);
  };

  return (
    <div className="choose-characters">
      <div className="row">
        <div className="col-xs-12">
          <div className="panel panel-default">
            <div className="panel-body welcome">
              <h4>Welcome to Kana Kata!</h4>
              <p>Please choose the characters you'd like to study. Click a row to select the whole group, or click ▼ to pick individual characters.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xs-12 text-center" style={{ marginBottom: '20px' }}>
          {
            errMsg !== '' &&
            <div className="error-message">{errMsg}</div>
          }
          <div ref={startRef}>
            <p style={{ marginBottom: '10px', color: '#666' }}>Choose a game mode:</p>
            <div style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ margin: 0, fontWeight: 'normal', color: '#666' }}>Questions:</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                style={{ width: '70px', display: 'inline-block', textAlign: 'center' }}
              />
            </div>
            <div className="stage-buttons">
              {stageDescriptions.map(({ stage, title, description }) => (
                <button
                  key={stage}
                  className="btn btn-danger stage-start-button"
                  onClick={() => startGame(stage)}
                  title={description}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-6">
          <div className="panel panel-default">
            <div className="panel-heading">Hiragana · ひらがな</div>
            <div className="panel-body selection-areas">
              {showGroupRows('hiragana', showAlternatives.indexOf('hiragana') >= 0)}
            </div>
            <div className="panel-footer text-center">
              <a href="javascript:" onClick={() => selectAll('hiragana')}>All</a> &nbsp;&middot;&nbsp; <a href="javascript:"
                onClick={() => selectNone('hiragana')}>None</a>
              &nbsp;&middot;&nbsp; <a href="javascript:" onClick={() => selectAll('hiragana', true)}>All alternative</a>
              &nbsp;&middot;&nbsp; <a href="javascript:" onClick={() => selectNone('hiragana', true)}>No alternative</a>
            </div>
          </div>
        </div>
        <div className="col-sm-6">
          <div className="panel panel-default">
            <div className="panel-heading">Katakana · カタカナ</div>
            <div className="panel-body selection-areas">
              {showGroupRows('katakana', showAlternatives.indexOf('katakana') >= 0, showSimilars.indexOf('katakana') >= 0)}
            </div>
            <div className="panel-footer text-center">
              <a href="javascript:" onClick={() => selectAll('katakana')}>All</a> &nbsp;&middot;&nbsp; <a href="javascript:"
                onClick={() => selectNone('katakana')}>None
              </a>
              &nbsp;&middot;&nbsp; <a href="javascript:" onClick={() => selectAll('katakana', true)}>All alternative</a>
              &nbsp;&middot;&nbsp; <a href="javascript:" onClick={() => selectNone('katakana', true)}>No alternative</a>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <CustomWordEditor />
          </div>
        </div>
        <div className="down-arrow"
          style={{ display: startIsVisible ? 'none' : 'block' }}
          onClick={(e) => scrollToStart()}
        >
          Start
        </div>
      </div>
    </div>
  );
};

export default ChooseCharacters;
