import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { useMovieDetails } from '../useMovieDetails';
import { filterMovieDetailsData } from '../../components/MovieDetails/filterMovieDetailsKeys';

/**
 * @description Set up a global fetch function, a mock filterMovieDetailsData function, and a TestComponent
 */
global.fetch = jest.fn();

jest.mock('../../components/MovieDetails/filterMovieDetailsKeys', () => ({
  filterMovieDetailsData: jest.fn(),
}));

function TestComponent({ movieId }: { movieId: string }) {
  const { movieDetails, detailsDataIsLoading } = useMovieDetails(movieId);
  return (
    <div>
      <div data-testid="loading">{detailsDataIsLoading.toString()}</div>
      <div data-testid="details">{JSON.stringify(movieDetails)}</div>
    </div>
  );
}

describe('useMovieDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch movie details and update state', async () => {
    const mockMovieDetails = { Title: 'Test Movie', Year: '2023' };
    const mockCleanMovieDetails = { title: 'Test Movie', year: '2023' };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockMovieDetails),
    });

    (filterMovieDetailsData as jest.Mock).mockReturnValueOnce(
      mockCleanMovieDetails
    );

    const { getByTestId } = render(<TestComponent movieId="tt1234567" />);

    expect(getByTestId('loading').textContent).toBe('true');
    expect(getByTestId('details').textContent).toBe('{}');

    await waitFor(() => {
      expect(getByTestId('loading').textContent).toBe('false');
      expect(getByTestId('details').textContent).toBe(
        JSON.stringify(mockCleanMovieDetails)
      );
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('tt1234567')
    );
    expect(filterMovieDetailsData).toHaveBeenCalledWith(mockMovieDetails);
  });

  it('should handle API errors', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { getByTestId } = render(<TestComponent movieId="tt1234567" />);

    expect(getByTestId('loading').textContent).toBe('true');

    await waitFor(() => {
      expect(getByTestId('loading').textContent).toBe('false');
      expect(getByTestId('details').textContent).toBe('{}');
    });

    expect(consoleLogSpy).toHaveBeenCalledWith({ error: expect.any(Error) });

    consoleLogSpy.mockRestore();
  });

  it('should re-fetch when movieDetailsId changes', async () => {
    const { getByTestId, rerender } = render(
      <TestComponent movieId="tt1234567" />
    );

    await waitFor(() => {
      expect(getByTestId('loading').textContent).toBe('false');
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('tt1234567')
    );

    rerender(<TestComponent movieId="tt7654321" />);

    await waitFor(() => {
      expect(getByTestId('loading').textContent).toBe('false');
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('tt7654321')
    );
  });

  it('should not re-fetch when the component rerenders but the movieId does not change', async () => {
    const { getByTestId, rerender } = render(
      <TestComponent movieId="tt1234567" />
    );

    await waitFor(() => {
      expect(getByTestId('loading').textContent).toBe('false');
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('tt1234567')
    );

    rerender(<TestComponent movieId="tt1234567" />);

    await waitFor(() => {
      expect(getByTestId('loading').textContent).toBe('false');
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('tt1234567')
    );
  });
});
