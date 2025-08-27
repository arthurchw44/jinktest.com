import { render, screen, fireEvent } from '@testing-library/react';
import { ArticleNameInput } from '../ArticleNameInput';
import { describe, test, expect, vi } from 'vitest';

console.log('ENV', typeof window, typeof document, typeof navigator);

describe('ArticleNameInput', () => {
  test('shows validation message for short name', () => {
    const onChange = vi.fn();
    render(<ArticleNameInput value="ab" onChange={onChange} />);
    expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
  });

  test('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<ArticleNameInput value="" onChange={onChange} />);
    const input = screen.getByPlaceholderText(/enter unique article identifier/i);
    fireEvent.change(input, { target: { value: 'climate-2025' } });
    expect(onChange).toHaveBeenCalledWith('climate-2025');
  });
});
