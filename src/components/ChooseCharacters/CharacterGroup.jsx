import React, { useState } from 'react';

const CharacterGroup = ({
  characters,
  selected,
  selectedChars,
  groupName,
  handleToggleSelect,
  handleToggleChar,
  whichKana
}) => {
  const [expanded, setExpanded] = useState(false);

  const getShowableCharacters = (whichKana) => {
    let strRomajiCharacters = '';
    let strKanaCharacters = '';
    Object.keys(characters).forEach(character => {
      strRomajiCharacters += characters[character][0] + ' · ';
      strKanaCharacters += character + ' · ';
    });
    strRomajiCharacters = strRomajiCharacters.slice(0, -2);
    strKanaCharacters = strKanaCharacters.slice(0, -2);
    if (whichKana === 'romaji') return strRomajiCharacters;
    else return strKanaCharacters;
  };

  const getGroupSelectionState = () => {
    if (!selectedChars) return selected ? 'all' : 'none';
    const charKeys = Object.keys(characters);
    const selectedCount = charKeys.filter(k => selectedChars.has(k)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === charKeys.length) return 'all';
    return 'partial';
  };

  const toggleExpanded = (e) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  };

  const kanaStr = getShowableCharacters('kana');
  const romajiStr = getShowableCharacters('romaji');
  const selectionState = getGroupSelectionState();
  const charKeys = Object.keys(characters);
  const canExpand = selectedChars && charKeys.length > 1;

  let checkClass = 'glyphicon glyphicon-small glyphicon-';
  if (selectionState === 'all') checkClass += 'check';
  else if (selectionState === 'partial') checkClass += 'check half';
  else checkClass += 'unchecked';

  return (
    <div
      className={
        'choose-row'
          + (groupName.endsWith('_a') || groupName.endsWith('_s') ? ' alt-row' : '')
          + (['h_group16_a', 'k_group18_a', 'k_group29_a'].includes(groupName) ? ' divider-row' : '')
          + (expanded ? ' expanded-group' : '')
      }
    >
      <div
        className="group-header"
        onClick={canExpand ? toggleExpanded : () => handleToggleSelect(groupName)}
      >
        <span
          className={checkClass}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleSelect(groupName);
          }}
        ></span>
        <span className="kana"> {kanaStr}</span>
        <span className="separator"> — </span>
        <span className="romaji">{romajiStr}</span>
        {canExpand && (
          <span className="expand-toggle">
            {expanded ? '▲' : '▼'}
          </span>
        )}
      </div>
      {expanded && selectedChars && handleToggleChar && (
        <div className="char-grid">
          {charKeys.map(kana => {
            const romaji = characters[kana][0];
            const isSelected = selectedChars.has(kana);
            return (
              <span
                key={kana}
                className={'char-item' + (isSelected ? ' char-selected' : '')}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleChar(kana, whichKana);
                }}
                title={romaji}
              >
                <span className={isSelected ?
                  'glyphicon glyphicon-tiny glyphicon-check' :
                  'glyphicon glyphicon-tiny glyphicon-unchecked'}></span>
                <span className="char-kana">{kana}</span>
                <span className="char-romaji">{romaji}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CharacterGroup;
