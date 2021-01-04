import React from 'react';
import { render, screen } from '@testing-library/react';
import Application from './application';

test('renders learn react link', () => {
  render(<Application />);
  const linkElement = screen.getAllByAltText(/logo/i);
  expect(linkElement).toBeInTheDocument();
});
