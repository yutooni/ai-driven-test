import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditor } from './NoteEditor';

describe('NoteEditor', () => {
  it('renders with placeholder', () => {
    const onChange = vi.fn();
    render(
      <NoteEditor
        value=""
        onChange={onChange}
        placeholder="Enter your note"
      />
    );

    const textarea = screen.getByPlaceholderText('Enter your note');
    expect(textarea).toBeInTheDocument();
  });

  it('renders with initial value', () => {
    const onChange = vi.fn();
    render(
      <NoteEditor
        value="Initial note content"
        onChange={onChange}
        placeholder="Enter your note"
      />
    );

    const textarea = screen.getByDisplayValue('Initial note content');
    expect(textarea).toBeInTheDocument();
  });

  it('calls onChange when text is entered', async () => {
    const onChange = vi.fn();
    render(
      <NoteEditor value="" onChange={onChange} placeholder="Enter your note" />
    );

    const textarea = screen.getByPlaceholderText('Enter your note');
    await userEvent.type(textarea, 'New note');

    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledTimes(8); // "New note" is 8 characters
  });

  it('does not call onChange when disabled', async () => {
    const onChange = vi.fn();
    render(
      <NoteEditor
        value=""
        onChange={onChange}
        placeholder="Enter your note"
        disabled
      />
    );

    const textarea = screen.getByPlaceholderText('Enter your note');
    await userEvent.type(textarea, 'New note');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    const onChange = vi.fn();
    render(
      <NoteEditor
        value=""
        onChange={onChange}
        placeholder="Enter your note"
        disabled
      />
    );

    const textarea = screen.getByPlaceholderText('Enter your note');
    expect(textarea).toBeDisabled();
  });

  it('handles multiline text', async () => {
    const onChange = vi.fn();
    render(
      <NoteEditor value="" onChange={onChange} placeholder="Enter your note" />
    );

    const textarea = screen.getByPlaceholderText('Enter your note');
    await userEvent.type(textarea, 'Line 1{Enter}Line 2');

    expect(onChange).toHaveBeenCalled();
  });

  it('renders with label', () => {
    const onChange = vi.fn();
    render(
      <NoteEditor
        value=""
        onChange={onChange}
        label="学習ノート"
        placeholder="Enter your note"
      />
    );

    const label = screen.getByText('学習ノート');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('associates label with textarea', () => {
    const onChange = vi.fn();
    render(
      <NoteEditor
        value=""
        onChange={onChange}
        label="学習ノート"
        placeholder="Enter your note"
      />
    );

    const label = screen.getByText('学習ノート') as HTMLLabelElement;
    const textarea = screen.getByPlaceholderText('Enter your note');

    expect(label.htmlFor).toBe(textarea.id);
    expect(textarea.id).toBeTruthy();
  });

  it('renders without label when label prop is not provided', () => {
    const onChange = vi.fn();
    render(
      <NoteEditor
        value=""
        onChange={onChange}
        placeholder="Enter your note"
      />
    );

    const labels = screen.queryAllByRole('textbox');
    expect(labels.length).toBe(1);
    expect(screen.queryByText('学習ノート')).not.toBeInTheDocument();
  });
});
