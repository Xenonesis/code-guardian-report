import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsGrid } from './StatsGrid';

describe('StatsGrid', () => {
  it('renders without crashing', () => {
    render(<StatsGrid />);
    expect(screen.getByText('Enterprise Clients')).toBeInTheDocument();
  });

  it('displays all statistics', () => {
    render(<StatsGrid />);
    expect(screen.getByText('Code Files Analyzed')).toBeInTheDocument();
    expect(screen.getByText('Security Issues Detected')).toBeInTheDocument();
    expect(screen.getByText('Programming Languages')).toBeInTheDocument();
  });
});