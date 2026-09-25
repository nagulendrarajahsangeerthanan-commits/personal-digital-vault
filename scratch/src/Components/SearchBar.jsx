import { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  }

  function handleClear() {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  }

  return (
    <section>
      <h2>Search Vault</h2>
      <div>
        <input
          type="text"
          placeholder="Search by document, folder or credential name..."
          value={query}
          onChange={handleChange}
        />
        {query && (
          <button type="button" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>
    </section>
  );
}