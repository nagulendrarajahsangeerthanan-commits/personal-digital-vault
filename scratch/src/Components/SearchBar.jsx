import { useState } from 'react';

export default function SearchBar({ onSearch }) {
  
  const [query, setQuery] = useState('');

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);
    
  const [searchTerm, setSearchTerm] = useState('');

  function handleSearch(e) {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (onSearch) {
      onSearch(value);
    }
  }

  function handleClear() {
    setQuery('');
    setSearchTerm('');
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
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search by document, folder, or credential name..."
          value={searchTerm}
          onChange={handleSearch}
        />
        {searchTerm && (
          <button type="button" onClick={handleClear} style={{ background: '#475569' }}>
            Clear
          </button>
        )}
      </div>
    </section>
  );
}
