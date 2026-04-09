import React, { useState, useEffect, useRef, useCallback } from 'react';
import { kanaDictionary } from '../../data/kanaDictionary';
import { removeFromArray, arrayContains, shuffle, findRomajisAtKanaKey } from '../../data/helperFuncs';

/*
Lightweight canvas drawing question for Stage 5 ("write the kana").
- Shows a target kana (same question selection logic as other stages)
- User draws on canvas; we compare the drawn bitmap against the target glyph
- For a simple, offline, no-font-metrics approach, we render the target glyph faintly on a hidden canvas and compare pixel overlap after normalization
- If similarity score >= threshold, mark correct, advance progress; else negative progress
*/

const DrawQuestion = ({ stage, decidedGroups, questionCount, handleStageComplete }) => {
  const [previousQuestion, setPreviousQuestion] = useState([]);
  const [previousAnswer, setPreviousAnswer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState([]);
  const [stageProgress, setStageProgress] = useState(0);
  const [similarity, setSimilarity] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [promptType, setPromptType] = useState('romaji');
  const [resultShown, setResultShown] = useState(false);
  const [resultCorrect, setResultCorrect] = useState(false);
  const [resultScore, setResultScore] = useState(0);
  const [resultPrecision, setResultPrecision] = useState(0);
  const [resultRecall, setResultRecall] = useState(0);
  const [resultTargetURL, setResultTargetURL] = useState('');
  const [resultOverlayURL, setResultOverlayURL] = useState('');
  const [resultPrecisionMapURL, setResultPrecisionMapURL] = useState('');
  const [resultRecallMapURL, setResultRecallMapURL] = useState('');
  const [showDebugMaps, setShowDebugMaps] = useState(false);
  const [results, setResults] = useState([]);

  const canvasRef = useRef(null);
  const nextBtnRef = useRef(null);
  const ctxRef = useRef(null);
  const hiddenRef = useRef(null);
  const hctxRef = useRef(null);
  const inkRef = useRef(null);
  const ictxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPtRef = useRef(null);

  const askableKanasRef = useRef({});
  const askableKanaKeysRef = useRef([]);
  const previousQuestionRef = useRef([]);
  const stageProgressRef = useRef(0);
  const resultsRef = useRef([]);
  const currentQuestionRef = useRef([]);

  const initializeCharacters = useCallback(() => {
    const askableKanas = {};
    const askableKanaKeys = [];

    Object.keys(kanaDictionary).forEach(whichKana => {
      Object.keys(kanaDictionary[whichKana]).forEach(groupName => {
        if (arrayContains(groupName, decidedGroups)) {
          Object.assign(askableKanas, kanaDictionary[whichKana][groupName]['characters']);
          Object.keys(kanaDictionary[whichKana][groupName]['characters']).forEach(key => {
            askableKanaKeys.push(key);
          });
        }
      });
    });

    askableKanasRef.current = askableKanas;
    askableKanaKeysRef.current = askableKanaKeys;
    previousQuestionRef.current = [];
    stageProgressRef.current = 0;
    resultsRef.current = [];
  }, [decidedGroups]);

  const getRandomKanas = useCallback((amount, include, exclude) => {
    let randomizedKanas = askableKanaKeysRef.current.slice();
    if (exclude && exclude.length > 0) {
      randomizedKanas = removeFromArray(exclude, randomizedKanas);
    }
    shuffle(randomizedKanas);
    randomizedKanas = randomizedKanas.slice(0, amount);
    return randomizedKanas;
  }, []);

  // Draw faint preview onto visible canvas if hint enabled
  const drawHintOverlay = useCallback((showHintFlag) => {
    const ctx = ctxRef.current;
    const hidden = hiddenRef.current;
    if (!ctx || !hidden) return;
    if (!showHintFlag) return;
    try {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.drawImage(hidden, 0, 0);
      ctx.restore();
    } catch (e) { /* ignore */ }
  }, []);

  // Draw current ink layer onto visible canvas (over grid / hint)
  const drawInkToVisible = useCallback(() => {
    const ctx = ctxRef.current;
    const ictx = ictxRef.current;
    const ink = inkRef.current;
    if (!ctx || !ictx || !ink) return;
    try {
      const inkImg = ictx.getImageData(0, 0, ink.width, ink.height);
      const tmp = document.createElement('canvas');
      tmp.width = ink.width; tmp.height = ink.height;
      const tctx = tmp.getContext('2d');
      tctx.putImageData(inkImg, 0, 0);
      ctx.drawImage(tmp, 0, 0);
    } catch (e) { /* ignore */ }
  }, []);

  // Clear only the visible canvas, preserve ink layer
  const clearVisibleCanvas = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const x = (canvas.width / 4) * i;
      const y = (canvas.height / 4) * i;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  }, []);

  // Existing method: clear both visible and ink
  const clearCanvas = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const ictx = ictxRef.current;
    const ink = inkRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (ictx && ink) ictx.clearRect(0, 0, ink.width, ink.height);
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const x = (canvas.width / 4) * i;
      const y = (canvas.height / 4) * i;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  }, []);

  // Recompose visible canvas: grid, optional hint, then ink
  const recomposeVisible = useCallback((showHintFlag) => {
    clearVisibleCanvas();
    drawHintOverlay(showHintFlag);
    drawInkToVisible();
  }, [clearVisibleCanvas, drawHintOverlay, drawInkToVisible]);

  const setNewQuestion = useCallback(() => {
    const newQuestion = getRandomKanas(1, false, previousQuestionRef.current);
    currentQuestionRef.current = newQuestion;
    setCurrentQuestion(newQuestion);
    setPromptType('romaji');
    clearCanvas();
    renderTargetToHidden();
    recomposeVisible(false);
  }, [getRandomKanas, clearCanvas, renderTargetToHidden, recomposeVisible]);

  const getPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;

    const hidden = document.createElement('canvas');
    hidden.width = canvas.width;
    hidden.height = canvas.height;
    hiddenRef.current = hidden;
    hctxRef.current = hidden.getContext('2d');

    const ink = document.createElement('canvas');
    ink.width = canvas.width;
    ink.height = canvas.height;
    inkRef.current = ink;
    ictxRef.current = ink.getContext('2d');

    isDrawingRef.current = false;
    lastPtRef.current = null;

    clearVisibleCanvas();
    recomposeVisible(false);
  }, [clearVisibleCanvas, recomposeVisible]);

  useEffect(() => {
    initializeCharacters();
    initCanvas();
    setNewQuestion();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const start = (e) => {
      if (resultShown) return;
      isDrawingRef.current = true;
      lastPtRef.current = getPoint(e);
    };

    const move = (e) => {
      if (!isDrawingRef.current || resultShown) return;
      const p = getPoint(e);
      const ctx = ctxRef.current;
      const ictx = ictxRef.current;

      if (ctx) {
        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPtRef.current.x, lastPtRef.current.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
      }

      if (ictx) {
        ictx.strokeStyle = '#000';
        ictx.lineWidth = 10;
        ictx.lineCap = 'round';
        ictx.beginPath();
        ictx.moveTo(lastPtRef.current.x, lastPtRef.current.y);
        ictx.lineTo(p.x, p.y);
        ictx.stroke();
      }

      lastPtRef.current = p;
    };

    const end = () => {
      if (resultShown) return;
      isDrawingRef.current = false;
    };

    canvas.onpointerdown = start;
    canvas.onpointermove = move;
    canvas.onpointerup = end;
    canvas.onpointerleave = end;

    return () => {
      if (canvas) {
        canvas.onpointerdown = null;
        canvas.onpointermove = null;
        canvas.onpointerup = null;
        canvas.onpointerleave = null;
      }
    };
  }, [initializeCharacters, initCanvas, setNewQuestion, getPoint, resultShown]);

  // Re-attach event listeners when resultShown changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const start = (e) => {
      if (resultShown) return;
      isDrawingRef.current = true;
      lastPtRef.current = getPoint(e);
    };

    const move = (e) => {
      if (!isDrawingRef.current || resultShown) return;
      const p = getPoint(e);
      const ctx = ctxRef.current;
      const ictx = ictxRef.current;

      if (ctx) {
        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPtRef.current.x, lastPtRef.current.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
      }

      if (ictx) {
        ictx.strokeStyle = '#000';
        ictx.lineWidth = 10;
        ictx.lineCap = 'round';
        ictx.beginPath();
        ictx.moveTo(lastPtRef.current.x, lastPtRef.current.y);
        ictx.lineTo(p.x, p.y);
        ictx.stroke();
      }

      lastPtRef.current = p;
    };

    const end = () => {
      if (resultShown) return;
      isDrawingRef.current = false;
    };

    canvas.onpointerdown = start;
    canvas.onpointermove = move;
    canvas.onpointerup = end;
    canvas.onpointerleave = end;
  }, [resultShown, getPoint]);

  const renderTargetToHidden = useCallback(() => {
    const hctx = hctxRef.current;
    const hidden = hiddenRef.current;
    if (!hctx || !hidden) return;

    hctx.clearRect(0, 0, hidden.width, hidden.height);
    hctx.fillStyle = '#000';
    hctx.strokeStyle = '#000';
    hctx.textAlign = 'center';
    hctx.textBaseline = 'middle';
    const fontSize = Math.floor(hidden.height * 0.7);
    hctx.font = `${fontSize}px "Hiragino Kaku Gothic Pro", "Meiryo", "MS PGothic", system-ui`;
    const kana = (currentQuestionRef.current && currentQuestionRef.current[0]) || '';
    hctx.lineWidth = Math.max(4, Math.floor(fontSize * 0.03));
    hctx.strokeText(kana, hidden.width / 2, hidden.height / 2);
    hctx.globalAlpha = 0.15;
    hctx.fillText(kana, hidden.width / 2, hidden.height / 2);
    hctx.globalAlpha = 1.0;
  }, []);

  // Compute bounding box of non-transparent pixels
  const getBBox = (imgData, width, height, alphaThresh = 10) => {
    let minX = width, minY = height, maxX = -1, maxY = -1;
    const data = imgData.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (data[i + 3] > alphaThresh) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0 || maxY < 0) return null;
    return { x: minX, y: minY, w: (maxX - minX + 1), h: (maxY - minY + 1) };
  };

  // Helper: shift the ink ImageData to align with target center
  const getAlignedInkImageData = useCallback(() => {
    try {
      const hidden = hiddenRef.current;
      const ictx = ictxRef.current;
      const hctx = hctxRef.current;
      const ink = inkRef.current;
      if (!hidden || !ictx || !hctx || !ink) return null;

      const width = hidden.width, height = hidden.height;
      const inkImg = ictx.getImageData(0, 0, width, height);
      const tgtImg = hctx.getImageData(0, 0, width, height);
      const bbInk = getBBox(inkImg, width, height);
      const bbTgt = getBBox(tgtImg, width, height);
      if (!bbInk || !bbTgt) return inkImg;
      const cxInk = bbInk.x + bbInk.w / 2;
      const cyInk = bbInk.y + bbInk.h / 2;
      const cxTgt = bbTgt.x + bbTgt.w / 2;
      const cyTgt = bbTgt.y + bbTgt.h / 2;
      const dx = Math.round(cxTgt - cxInk);
      const dy = Math.round(cyTgt - cyInk);
      const tmp = document.createElement('canvas'); tmp.width = width; tmp.height = height;
      const tctx = tmp.getContext('2d');
      const src = document.createElement('canvas'); src.width = width; src.height = height;
      const sctx = src.getContext('2d'); sctx.putImageData(inkImg, 0, 0);
      tctx.clearRect(0, 0, width, height);
      tctx.drawImage(src, dx, dy);
      return tctx.getImageData(0, 0, width, height);
    } catch (e) {
      const ictx = ictxRef.current;
      const ink = inkRef.current;
      if (ictx && ink) return ictx.getImageData(0, 0, ink.width, ink.height);
      return null;
    }
  }, []);

  // Helper: shallow copy ImageData
  const copyImageData = (imgData) => {
    return new ImageData(new Uint8ClampedArray(imgData.data), imgData.width, imgData.height);
  };

  // Helper: simple morphological dilation on alpha channel
  const dilateAlpha = (imgData, width, height, iterations = 1) => {
    const src = new Uint8ClampedArray(imgData.data);
    const getA = (x, y) => src[((y * width + x) * 4) + 3] || 0;
    for (let it = 0; it < iterations; it++) {
      const dst = imgData.data;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let maxA = 0;
          for (let ny = y - 1; ny <= y + 1; ny++) {
            if (ny < 0 || ny >= height) continue;
            for (let nx = x - 1; nx <= x + 1; nx++) {
              if (nx < 0 || nx >= width) continue;
              const a = getA(nx, ny);
              if (a > maxA) maxA = a;
            }
          }
          const i = (y * width + x) * 4;
          dst[i] = src[i];
          dst[i + 1] = src[i + 1];
          dst[i + 2] = src[i + 2];
          dst[i + 3] = maxA;
        }
      }
      for (let i = 0; i < src.length; i++) src[i] = imgData.data[i];
    }
    return imgData;
  };

  // Build data URLs for result preview
  const buildResultPreviews = useCallback((drawnImgData) => {
    try {
      const hidden = hiddenRef.current;
      const hctx = hctxRef.current;
      if (!hidden || !hctx) return;

      const ovCanvas = document.createElement('canvas');
      ovCanvas.width = hidden.width; ovCanvas.height = hidden.height;
      const ovCtx = ovCanvas.getContext('2d');
      ovCtx.strokeStyle = '#eee'; ovCtx.lineWidth = 1;
      for (let i = 1; i < 4; i++) { const x = (ovCanvas.width / 4) * i, y = (ovCanvas.height / 4) * i; ovCtx.beginPath(); ovCtx.moveTo(x, 0); ovCtx.lineTo(x, ovCanvas.height); ovCtx.stroke(); ovCtx.beginPath(); ovCtx.moveTo(0, y); ovCtx.lineTo(ovCanvas.width, y); ovCtx.stroke(); }
      ovCtx.save(); ovCtx.globalAlpha = 0.10; ovCtx.drawImage(hidden, 0, 0); ovCtx.restore();
      const inkImg = drawnImgData;
      const inkCanvas = document.createElement('canvas'); inkCanvas.width = hidden.width; inkCanvas.height = hidden.height;
      inkCanvas.getContext('2d').putImageData(inkImg, 0, 0);
      ovCtx.save(); ovCtx.globalAlpha = 0.48; ovCtx.globalCompositeOperation = 'source-over'; ovCtx.drawImage(inkCanvas, 0, 0); ovCtx.restore();
      const overlayURL = ovCanvas.toDataURL();

      const targetImg = hctx.getImageData(0, 0, hidden.width, hidden.height);
      const width = hidden.width, height = hidden.height;
      const alignedInkForMaps = dilateAlpha(copyImageData(inkImg), width, height, 1);
      const precCanvas = document.createElement('canvas'); precCanvas.width = width; precCanvas.height = height; const pctx = precCanvas.getContext('2d'); const pData = pctx.createImageData(width, height);
      const recCanvas = document.createElement('canvas'); recCanvas.width = width; recCanvas.height = height; const rctx = recCanvas.getContext('2d'); const rData = rctx.createImageData(width, height);
      const drawn = alignedInkForMaps.data; const target = targetImg.data; const alphaThresh = 10;
      for (let i = 0; i < drawn.length; i += 4) {
        const d = drawn[i + 3] > alphaThresh; const t = target[i + 3] > alphaThresh;
        if (d) {
          if (t) { pData.data[i] = 30; pData.data[i + 1] = 200; pData.data[i + 2] = 30; pData.data[i + 3] = 180; }
          else { pData.data[i] = 220; pData.data[i + 1] = 40; pData.data[i + 2] = 40; pData.data[i + 3] = 180; }
        } else { pData.data[i] = 0; pData.data[i + 1] = 0; pData.data[i + 2] = 0; pData.data[i + 3] = 0; }
        if (t) {
          if (d) { rData.data[i] = 30; rData.data[i + 1] = 200; rData.data[i + 2] = 30; rData.data[i + 3] = 160; }
          else { rData.data[i] = 240; rData.data[i + 1] = 140; rData.data[i + 2] = 20; rData.data[i + 3] = 160; }
        } else { rData.data[i] = 0; rData.data[i + 1] = 0; rData.data[i + 2] = 0; rData.data[i + 3] = 0; }
      }
      pctx.putImageData(pData, 0, 0); rctx.putImageData(rData, 0, 0);
      const precisionMapURL = precCanvas.toDataURL(); const recallMapURL = recCanvas.toDataURL();

      setResultTargetURL('');
      setResultOverlayURL(overlayURL);
      setResultPrecisionMapURL(precisionMapURL);
      setResultRecallMapURL(recallMapURL);
    } catch (e) { /* ignore */ }
  }, []);

  const computeSimilarity = useCallback(() => {
    try {
      const hidden = hiddenRef.current;
      const hctx = hctxRef.current;
      if (!hidden || !hctx) return;

      const width = hidden.width, height = hidden.height;
      const alignedInk = getAlignedInkImageData();
      if (!alignedInk) return;

      const dilatedInk = dilateAlpha(copyImageData(alignedInk), width, height, 1);
      const targetImg = hctx.getImageData(0, 0, width, height);
      const drawn = dilatedInk.data;
      const target = targetImg.data;
      let inter = 0, countDrawn = 0, countTarget = 0;
      const alphaThresh = 10;
      for (let i = 0; i < drawn.length; i += 4) {
        const d = drawn[i + 3] > alphaThresh;
        const t = target[i + 3] > alphaThresh;
        if (d) countDrawn++;
        if (t) countTarget++;
        if (d && t) inter++;
      }
      const precision = countDrawn ? inter / countDrawn : 0;
      const recall = countTarget ? inter / countTarget : 0;
      const score = (0.8 * precision) + (0.2 * recall);
      const meetsRecall = recall >= 0.15;
      const isCorrect = meetsRecall && (score >= 0.49 && precision >= 0.4);

      setSimilarity(score);
      setResultShown(true);
      setResultCorrect(isCorrect);
      setResultScore(score);
      setResultPrecision(precision);
      setResultRecall(recall);

      setTimeout(() => {
        if (nextBtnRef.current && nextBtnRef.current.scrollIntoView) {
          nextBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 0);

      buildResultPreviews(alignedInk);
    } catch (e) { /* ignore */ }
  }, [getAlignedInkImageData, buildResultPreviews]);

  const onSubmit = useCallback((correct) => {
    previousQuestionRef.current = currentQuestionRef.current;
    setPreviousQuestion(currentQuestionRef.current);

    const kana = currentQuestionRef.current[0] || '';
    const romaji = findRomajisAtKanaKey(kana, kanaDictionary)[0] || '';
    const resultEntry = {
      question: romaji,
      correctAnswer: kana,
      userAnswer: correct ? kana : '(drawing)',
      correct: correct
    };

    const newResults = [...resultsRef.current, resultEntry];
    resultsRef.current = newResults;
    setResults(newResults);

    if (correct) {
      stageProgressRef.current = stageProgressRef.current + 1;
    }
    setStageProgress(stageProgressRef.current);

    if (stageProgressRef.current >= questionCount) {
      handleStageComplete(newResults);
    } else {
      setNewQuestion();
    }
  }, [questionCount, handleStageComplete, setNewQuestion]);

  const proceedNext = () => {
    const correct = resultCorrect;
    setResultShown(false);
    onSubmit(correct);
  };

  const getPromptText = () => {
    const kana = (currentQuestionRef.current && currentQuestionRef.current[0]) || (currentQuestion[0] || '');
    if (promptType === 'romaji') {
      const arr = findRomajisAtKanaKey(kana, kanaDictionary);
      return (arr && arr[0]) || '';
    }
    return kana;
  };

  const togglePromptType = () => {
    setPromptType(prev => prev === 'romaji' ? 'kana' : 'romaji');
  };

  const handleClear = () => {
    clearCanvas();
    drawHintOverlay(showHint);
    setSimilarity(0);
  };

  const handleHintChange = (checked) => {
    setShowHint(checked);
    renderTargetToHidden();
    recomposeVisible(checked);
  };

  const stageProgressPercentage = Math.round((stageProgress / questionCount) * 100) + '%';
  const stageProgressPercentageStyle = { width: stageProgressPercentage };
  const canvasStyle = { border: '1px solid #ccc', touchAction: 'none', pointerEvents: resultShown ? 'none' : 'auto' };
  const promptText = getPromptText();

  return (
    <div className="text-center question col-xs-12">
      <div className="previous-result none">Draw the character as accurately as you can.</div>
      <div style={{ margin: '6px 0', fontSize: '72px' }}>{promptText}</div>
      <div>
        <canvas ref={canvasRef} width={320} height={320} style={canvasStyle} />
      </div>
      {/* hint toggle */}
      <div style={{ marginTop: 6 }}>
        <label style={{ cursor: 'pointer', userSelect: 'none' }}>
          <input type="checkbox" checked={showHint} onChange={(e) => handleHintChange(e.target.checked)} />
          &nbsp;Show hint (preview)
        </label>
      </div>
      {
        !resultShown ? (
          <div style={{ marginTop: 8 }}>
            <button className="btn btn-default" onClick={handleClear}>Clear</button>
            <button className="btn btn-primary" style={{ marginLeft: 8 }} onClick={computeSimilarity}>Submit</button>
          </div>
        ) : (
          <div style={{ marginTop: 8 }}>
            <div className={resultCorrect ? 'previous-result correct' : 'previous-result wrong'} style={{ marginBottom: 8, fontWeight: 400 }}>
              {resultCorrect ? 'Correct!' : 'Not quite.'} &nbsp;Score: {(resultScore * 100).toFixed(0)}% &middot; Precision: {(resultPrecision * 100).toFixed(0)}% &middot; Recall: {(resultRecall * 100).toFixed(0)}%
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div className="text-muted" style={{ marginBottom: 4, fontWeight: 400 }}>Your strokes (overlay)</div>
                {resultOverlayURL && (
                  <div style={{ width: 160, height: 160, border: '1px solid #ddd', borderRadius: 2, overflow: 'hidden', display: 'inline-block' }}>
                    <img alt="Overlay" src={resultOverlayURL} width={160} height={160} />
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  <label style={{ cursor: 'pointer', fontWeight: 400 }}>
                    <input type="checkbox" checked={showDebugMaps} onChange={(e) => setShowDebugMaps(e.target.checked)} />
                    &nbsp;Stroke debug maps
                  </label>
                </div>
              </div>
              {showDebugMaps && (
                <>
                  <div>
                    <div className="text-muted" style={{ marginBottom: 4, fontWeight: 400 }}>Precision map</div>
                    {resultPrecisionMapURL && (
                      <div style={{ width: 160, height: 160, border: '1px solid #ddd', borderRadius: 2, overflow: 'hidden', display: 'inline-block' }}>
                        <img alt="Precision" src={resultPrecisionMapURL} width={160} height={160} />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-muted" style={{ marginBottom: 4, fontWeight: 400 }}>Recall map</div>
                    {resultRecallMapURL && (
                      <div style={{ width: 160, height: 160, border: '1px solid #ddd', borderRadius: 2, overflow: 'hidden', display: 'inline-block' }}>
                        <img alt="Recall" src={resultRecallMapURL} width={160} height={160} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div style={{ marginTop: 8, position: 'sticky', bottom: 12, zIndex: 10 }}>
              <button ref={nextBtnRef} className="btn btn-primary" onClick={proceedNext}>Next</button>
            </div>
          </div>
        )
      }
      {/* prompt hint button at the bottom */}
      <div style={{ marginTop: 8 }}>
        <button className="btn btn-default" onClick={togglePromptType}>
          {promptType === 'romaji' ? 'Show kana hint' : 'Show romaji'}
        </button>
      </div>
      {/* progress bar */}
      <div className="progress" style={{ marginTop: 8 }}>
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

export default DrawQuestion;
