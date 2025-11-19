// simplified text buffer implementation for ruby cli
// todo: migrate full gemini text buffer functionality

export class TextBuffer {
  private content: string = '';
  private cursorPos: number = 0;

  get text(): string {
    return this.content;
  }

  get cursor(): [number, number] {
    // convert linear position to [row, col]
    const lines = this.content.split('\n');
    let pos = 0;
    
    for (let row = 0; row < lines.length; row++) {
      const lineLength = lines[row]!.length + (row < lines.length - 1 ? 1 : 0); // +1 for newline
      if (pos + lineLength > this.cursorPos) {
        return [row, this.cursorPos - pos];
      }
      pos += lineLength;
    }
    
    return [lines.length - 1, lines[lines.length - 1]?.length || 0];
  }

  get lines(): string[] {
    return this.content.split('\n');
  }

  get viewportVisualLines(): string[] {
    // simplified: just return all lines for now
    return this.lines;
  }

  get visualCursor(): [number, number] {
    // simplified: same as logical cursor for now
    return this.cursor;
  }

  get visualScrollRow(): number {
    return 0; // no scrolling for now
  }

  get allVisualLines(): string[] {
    return this.lines;
  }

  setText(text: string): void {
    this.content = text;
    this.cursorPos = Math.min(this.cursorPos, text.length);
  }

  handleInput(key: { sequence?: string; name?: string; backspace?: boolean; delete?: boolean; return?: boolean; paste?: boolean }): void {
    if (key.backspace) {
      this.backspace();
    } else if (key.delete) {
      this.delete();
    } else if (key.return) {
      this.newline();
    } else if (key.sequence && !key.paste) {
      this.insertText(key.sequence);
    }
  }

  insertText(text: string): void {
    const before = this.content.slice(0, this.cursorPos);
    const after = this.content.slice(this.cursorPos);
    this.content = before + text + after;
    this.cursorPos += text.length;
  }

  backspace(): void {
    if (this.cursorPos > 0) {
      const before = this.content.slice(0, this.cursorPos - 1);
      const after = this.content.slice(this.cursorPos);
      this.content = before + after;
      this.cursorPos--;
    }
  }

  delete(): void {
    if (this.cursorPos < this.content.length) {
      const before = this.content.slice(0, this.cursorPos);
      const after = this.content.slice(this.cursorPos + 1);
      this.content = before + after;
    }
  }

  newline(): void {
    this.insertText('\n');
  }

  move(direction: 'left' | 'right' | 'up' | 'down' | 'home' | 'end'): void {
    switch (direction) {
      case 'left':
        this.cursorPos = Math.max(0, this.cursorPos - 1);
        break;
      case 'right':
        this.cursorPos = Math.min(this.content.length, this.cursorPos + 1);
        break;
      case 'home':
        this.cursorPos = 0;
        break;
      case 'end':
        this.cursorPos = this.content.length;
        break;
      case 'up':
      case 'down':
        // todo: implement up/down movement
        break;
      default:
        break;
    }
  }

  moveToOffset(offset: number): void {
    this.cursorPos = Math.max(0, Math.min(this.content.length, offset));
  }

  replaceRangeByOffset(start: number, end: number, text: string): void {
    const before = this.content.slice(0, start);
    const after = this.content.slice(end);
    this.content = before + text + after;
    this.cursorPos = start + text.length;
  }

  killLineRight(): void {
    const [row, col] = this.cursor;
    const lines = this.lines;
    if (row < lines.length) {
      lines[row] = lines[row]!.slice(0, col);
      this.content = lines.join('\n');
    }
  }

  killLineLeft(): void {
    const [row, col] = this.cursor;
    const lines = this.lines;
    if (row < lines.length) {
      lines[row] = lines[row]!.slice(col);
      this.content = lines.join('\n');
      this.cursorPos -= col;
    }
  }

  openInExternalEditor(): void {
    // todo: implement external editor support
    console.warn('external editor not implemented yet');
  }
}

export function logicalPosToOffset(lines: string[], row: number, col: number): number {
  let offset = 0;
  for (let i = 0; i < row && i < lines.length; i++) {
    offset += lines[i]!.length + 1; // +1 for newline
  }
  return offset + col;
}

export function useTextBuffer(initialText: string = ''): TextBuffer {
  // todo: convert to proper hook with state management
  const buffer = new TextBuffer();
  buffer.setText(initialText);
  return buffer;
}