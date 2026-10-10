import React from 'react';
import DOMPurify from 'dompurify';

function ProductCard({ product }) {
  // FIX: Sanitize HTML before rendering
  const sanitizedDescription = DOMPurify.sanitize(product.description);
  return (
    <div className="product-card">
      <h2>{product.name}</h2>
      <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
      <p className="price">${product.price}</p>
    </div>
  );
}

function SearchResults({ query, results }) {
  // FIX: Render text safely
  return (
    <div>
      <h1>Results for: {query}</h1>
      {results.map((r, i) => (
        <p key={i}>{r.summary}</p>
      ))}
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <h1>E-Commerce Store</h1>
      <ProductCard product={{ name: 'Demo', description: '<b>Safe HTML</b>', price: 29.99 }} />
    </div>
  );
}

export default App;
