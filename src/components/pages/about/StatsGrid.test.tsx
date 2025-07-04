import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsGrid } from './StatsGrid';

describe('StatsGrid', () => {
  it('renders without crashing', () => {
    render(<StatsGrid />);
    expect(screen.getByText('Developers Trust Us')).toBeInTheDocument();
  });

  it('displays all statistics', () => {
    render(<StatsGrid />);
    expect(screen.getByText('Files Analyzed')).toBeInTheDocument();
    expect(screen.getByText('Vulnerabilities Found')).toBeInTheDocument();
    expect(screen.getByText('Languages Supported')).toBeInTheDocument();
  });
});