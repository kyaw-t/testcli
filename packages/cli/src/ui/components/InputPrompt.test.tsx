import React from 'react';
import { render } from 'ink-testing-library';
import { InputPrompt } from './InputPrompt.js';
import { describe, it, expect, vi } from 'vitest';

describe('InputPrompt', () => {
  it('renders placeholder when no input', () => {
    const onSubmit = vi.fn();
    const { lastFrame } = render(<InputPrompt onSubmit={onSubmit} placeholder="test placeholder" />);
    
    expect(lastFrame()).toContain('test placeholder');
  });

  it('renders prompt symbol', () => {
    const onSubmit = vi.fn();
    const { lastFrame } = render(<InputPrompt onSubmit={onSubmit} />);
    
    expect(lastFrame()).toContain('❯');
  });
});