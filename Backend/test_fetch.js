const http = require('http');

http.get('http://localhost:5000/api/products', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const products = JSON.parse(data).products || JSON.parse(data) || [];
    if (products.length > 0) {
      const pId = products[0]._id;
      console.log('Fetching reviews for:', pId);
      http.get(`http://localhost:5000/api/reviews/${pId}`, (res2) => {
        let revData = '';
        res2.on('data', chunk => revData += chunk);
        res2.on('end', () => {
          console.log('Reviews:', revData);
        });
      });
    } else {
      console.log('No products found');
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
