export interface City {
  id: string;
  name: string;
  timezone: string;
  country?: string;
}

export interface SearchResult {
  name: string;
  timezone: string;
  country: string;
}
