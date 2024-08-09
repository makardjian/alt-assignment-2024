export type UseSearchResults = {
  searchQuery: string;
  currentPage: number;
  setShowNoResultsMessage: (value: boolean) => void;
  setSearchError: (value: boolean) => void;
};
