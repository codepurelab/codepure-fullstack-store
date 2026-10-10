import React from 'react';

function ProductCard({ product }) {
  // VULN: XSS via dangerouslySetInnerHTML
  return (
    <div className="product-card">
      <h2>{product.name}</h2>
      <div dangerouslySetInnerHTML={{ __html: product.description }} />
      <p className="price">${product.price}</p>
    </div>
  );
}

function SearchResults({ query, results }) {
  // VULN: XSS - rendering unsanitized HTML
  return (
    <div>
      <h1 dangerouslySetInnerHTML={{ __html: `Results for: ${query}` }} />
      {results.map((r, i) => (
        <div key={i} dangerouslySetInnerHTML={{ __html: r.summary }} />
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
