import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CodeEditor from '../CodeEditor';

describe('CodeEditor', () => {
  const mockOnChange = vi.fn();
  const sampleCode = 'def hello(): return "world"';

  it('renders correctly with initial code', () => {
    render(<CodeEditor code={sampleCode} onChange={mockOnChange} />);
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('displays correct language label', () => {
    render(<CodeEditor code={sampleCode} onChange={mockOnChange} language="javascript" />);
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('shows editing indicator when focused', () => {
    render(<CodeEditor code={sampleCode} onChange={mockOnChange} />);
    expect(screen.queryByText('● Editing')).not.toBeInTheDocument();
  });

  it('displays line count', () => {
    render(<CodeEditor code={sampleCode} onChange={mockOnChange} />);
    const lineElements = screen.getAllByText(/行/);
    expect(lineElements.length).toBeGreaterThan(0);
  });

  it('displays character count', () => {
    render(<CodeEditor code={sampleCode} onChange={mockOnChange} />);
    const charElements = screen.getAllByText(/字符/);
    expect(charElements.length).toBeGreaterThan(0);
  });

  it('displays run code hint', () => {
    render(<CodeEditor code={sampleCode} onChange={mockOnChange} />);
    expect(screen.getByText(/Ctrl\+Enter 运行/)).toBeInTheDocument();
  });
});
