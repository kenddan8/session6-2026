import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TodoCard from '../TodoCard';

describe('TodoCard Component', () => {
  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    dueDate: '2025-12-25',
    completed: 0,
    createdAt: '2025-11-01T00:00:00Z'
  };

  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render todo title and due date', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText(/December 25, 2025/)).toBeInTheDocument();
  });

  it('should render unchecked checkbox when todo is incomplete', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked checkbox when todo is complete', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should show edit button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    expect(editButton).toBeInTheDocument();
  });

  it('should show delete button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked and confirmed', () => {
    window.confirm = jest.fn(() => true);
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    fireEvent.click(deleteButton);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should enter edit mode when edit button is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
  });

  it('should apply completed class when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    const { container } = render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const card = container.querySelector('.todo-card');
    expect(card).toHaveClass('completed');
  });

  it('should not render due date when dueDate is null', () => {
    const todoNoDate = { ...mockTodo, dueDate: null };
    render(<TodoCard todo={todoNoDate} {...mockHandlers} isLoading={false} />);
    
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });

  describe('Overdue badge', () => {
    it('renders the Overdue badge for a todo with a past dueDate and completed: 0', () => {
      const overdueTodo = { ...mockTodo, dueDate: '2020-01-01', completed: 0 };
      render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);

      expect(screen.getByText('Overdue')).toBeInTheDocument();
    });

    it('does not render the Overdue badge for a todo due today', () => {
      const today = new Date().toISOString().slice(0, 10);
      const todoDueToday = { ...mockTodo, dueDate: today, completed: 0 };
      render(<TodoCard todo={todoDueToday} {...mockHandlers} isLoading={false} />);

      expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
    });

    it('does not render the Overdue badge for a todo due in the future', () => {
      const todoDueFuture = { ...mockTodo, dueDate: '2099-01-01', completed: 0 };
      render(<TodoCard todo={todoDueFuture} {...mockHandlers} isLoading={false} />);

      expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
    });

    it('does not render the Overdue badge for a todo with no dueDate', () => {
      const todoNoDate = { ...mockTodo, dueDate: null, completed: 0 };
      render(<TodoCard todo={todoNoDate} {...mockHandlers} isLoading={false} />);

      expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
    });

    it('badge is absent when an overdue todo becomes completed, and reappears when marked incomplete again', () => {
      const overdueTodo = { ...mockTodo, dueDate: '2020-01-01', completed: 0 };
      const { rerender } = render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);

      expect(screen.getByText('Overdue')).toBeInTheDocument();

      const completedTodo = { ...overdueTodo, completed: 1 };
      rerender(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);

      expect(screen.queryByText('Overdue')).not.toBeInTheDocument();

      rerender(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);

      expect(screen.getByText('Overdue')).toBeInTheDocument();
    });

    it('badge disappears once an overdue todo due date is edited to tomorrow', async () => {
      const overdueTodo = { ...mockTodo, dueDate: '2020-01-01', completed: 0 };
      const { rerender } = render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);

      expect(screen.getByText('Overdue')).toBeInTheDocument();

      const editButton = screen.getByLabelText(/Edit/);
      fireEvent.click(editButton);

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const dueDateInput = screen.getByLabelText('Edit due date');
      fireEvent.change(dueDateInput, { target: { value: tomorrow } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      expect(mockHandlers.onEdit).toHaveBeenCalledWith(overdueTodo.id, overdueTodo.title, tomorrow);

      const editedTodo = { ...overdueTodo, dueDate: tomorrow };
      rerender(<TodoCard todo={editedTodo} {...mockHandlers} isLoading={false} />);

      expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
    });

    it('marks a todo due "today" as overdue once the periodic timer ticks past midnight, without remounting', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-07-29T23:59:00'));

      const todoDueToday = { ...mockTodo, dueDate: '2026-07-29', completed: 0 };
      render(<TodoCard todo={todoDueToday} {...mockHandlers} isLoading={false} />);

      expect(screen.queryByText('Overdue')).not.toBeInTheDocument();

      jest.setSystemTime(new Date('2026-07-30T00:01:00'));
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(screen.getByText('Overdue')).toBeInTheDocument();

      jest.useRealTimers();
    });
  });
});
