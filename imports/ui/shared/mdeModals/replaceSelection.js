export function replaceSelection(cm, active, startEnd, url) {
  if (/editor-preview-active/.test(cm.getWrapperElement().lastChild.className)) {
    return;
  }
  let text;
  let start = startEnd[0];
  let end = startEnd[1];
  let startPoint = cm.getCursor('start');
  let endPoint = cm.getCursor('end');
  if (url) {
    end = end.replace('#url#', url);
  }
  if (active) {
    text = cm.getLine(startPoint.line);
    start = text.slice(0, startPoint.ch);
    end = text.slice(startPoint.ch);
    cm.replaceRange(start + end, {
      line: startPoint.line,
      ch: 0
    });
  }
  else {
    text = cm.getSelection();
    cm.replaceSelection(start + text + end);
    startPoint.ch += start.length;
    if (startPoint !== endPoint) {
      endPoint.ch += start.length;
    }
  }
  cm.setSelection(startPoint, endPoint);
  cm.focus();
}
;
