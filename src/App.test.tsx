import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

/**
 * @descriiption explicitly mock the custom hooks
 */
jest.mock('./hooks/useSearchResults', () => ({
  useSearchResults: jest.fn(),
}));

jest.mock('./hooks/useMovieDetails', () => ({
  useMovieDetails: jest.fn(),
}));

/**
 * @descriiption import the mocked hooks below where they are mocked
 */
import { useSearchResults } from './hooks/useSearchResults';
import { useMovieDetails } from './hooks/useMovieDetails';

describe('App Component', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    /**
     * @descriiption Set up default mock implementations
     */
    (useSearchResults as jest.Mock).mockReturnValue({
      searchDataIsLoading: false,
      searchResults: [],
      pageCount: 0,
    });

    (useMovieDetails as jest.Mock).mockReturnValue({
      movieDetails: null,
      detailsDataIsLoading: false,
    });
  });

  test('renders Cinema Center header', () => {
    render(<App />);
    expect(screen.getByText('Cinema Center')).toBeInTheDocument();
  });

  test('renders MovieSearchBar component', () => {
    render(<App />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  test('updates input value on change', () => {
    render(<App />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Inception' } });
    expect(input).toHaveValue('Inception');
  });

  test('calls onSearch when search button is clicked', async () => {
    render(<App />);
    const input = screen.getByRole('textbox');
    const searchButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: 'Inception' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(useSearchResults).toHaveBeenCalledWith(
        expect.objectContaining({
          searchQuery: 'Inception',
          currentPage: 1,
        })
      );
    });
  });

  test('displays MovieSearchResults when search results are available', async () => {
    (useSearchResults as jest.Mock).mockReturnValue({
      searchDataIsLoading: false,
      searchResults: [{ imdbID: '1', Title: 'Inception' }],
      pageCount: 1,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });
  });

  test('displays pagination when there are multiple pages of results', async () => {
    (useSearchResults as jest.Mock).mockReturnValue({
      searchDataIsLoading: false,
      searchResults: [{ imdbID: '1', Title: 'Inception' }],
      pageCount: 2,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('→')).toBeInTheDocument();
    });
  });
});
