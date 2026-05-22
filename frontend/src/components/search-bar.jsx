import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../api/axios";

export function SearchBar() {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length > 1) {
      fetch(`${API_URL}/products/search?q=${query}`)
        .then(res => res.json())
        .then(data => setResults(data.products));
    }
  }, [query]);

  return (
    <div>
      <input
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div>
        {results.map((p) => (
          <Link key={p._id} to={`/product/${p._id}`}>
            <p>{p.name} - ₹{p.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}