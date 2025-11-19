import { useInput } from 'ink';

export interface Key {
  sequence?: string;
  name?: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  backspace?: boolean;
  delete?: boolean;
  return?: boolean;
  paste?: boolean;
  upArrow?: boolean;
  downArrow?: boolean;
  leftArrow?: boolean;
  rightArrow?: boolean;
  tab?: boolean;
  escape?: boolean;
}

export function useKeypress(
  handler: (key: Key) => void,
  options: { isActive: boolean }
): void {
  useInput((input, key) => {
    if (!options.isActive) return;

    const keyObj: Key = {
      sequence: input,
      name: key.upArrow ? 'up' : 
            key.downArrow ? 'down' :
            key.leftArrow ? 'left' :
            key.rightArrow ? 'right' :
            key.escape ? 'escape' :
            key.tab ? 'tab' :
            key.return ? 'return' :
            key.backspace ? 'backspace' :
            key.delete ? 'delete' : undefined,
      ctrl: key.ctrl,
      meta: key.meta,
      shift: key.shift,
      backspace: key.backspace,
      delete: key.delete,
      return: key.return,
      upArrow: key.upArrow,
      downArrow: key.downArrow,
      leftArrow: key.leftArrow,
      rightArrow: key.rightArrow,
      tab: key.tab,
      escape: key.escape,
    };

    handler(keyObj);
  });
}