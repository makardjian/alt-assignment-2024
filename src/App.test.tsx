import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders search bar and results', async () => {
  render(<App />);

  const searchInput = screen.getByPlaceholderText(/search movies/i);
  fireEvent.change(searchInput, { target: { value: 'Inception' } });

  const searchButton = screen.getByText(/search/i);
  fireEvent.click(searchButton);

  const resultItem = await screen.findByText(/Inception/i);
  expect(resultItem).toBeInTheDocument();
});
