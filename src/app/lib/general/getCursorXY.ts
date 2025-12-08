/**
 * Returns the {x, y} coordinates of the cursor in a textarea, relative to the textarea's top-left corner.
 */
export function getCursorXY(textarea: HTMLTextAreaElement, selectionPoint: number) {
    const {
      offsetLeft: inputX,
      offsetTop: inputY,
    } = textarea;
  
    // Create a dummy div to mirror the textarea
    const div = document.createElement('div');
    
    // Copy styles to ensure it matches the textarea
    const styles = window.getComputedStyle(textarea);
    
    // Specific styles for mirroring
    const copyProperties = [
      'boxSizing',
      'width', 
      'height',
      'overflowX',
      'overflowY', 
  
      'borderTopWidth',
      'borderRightWidth',
      'borderBottomWidth',
      'borderLeftWidth',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
  
      'fontStyle',
      'fontVariant',
      'fontWeight',
      'fontStretch',
      'fontSize',
      'lineHeight',
      'fontFamily',
  
      'textAlign',
      'textTransform',
      'textIndent',
      'textDecoration',
  
      'letterSpacing',
      'wordSpacing',
    ];
  
    copyProperties.forEach((prop) => {
      div.style[prop as any] = styles[prop as any];
    });
  
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.textContent = textarea.value.substring(0, selectionPoint);
  
    // Create a span to represent the cursor position
    const span = document.createElement('span');
    span.textContent = textarea.value.substring(selectionPoint) || '.';
    div.appendChild(span);
  
    document.body.appendChild(div);
  
    const { offsetLeft: spanX, offsetTop: spanY } = span;
    
    document.body.removeChild(div);
  
    return {
      x: inputX + spanX,
      y: inputY + spanY,
    };
  }
