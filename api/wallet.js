const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS for GitHub Pages
  const allowedOrigins = [
    'https://gluewear.github.io',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'null' // for local file testing
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || origin?.startsWith('https://gluewear.github.io')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const WALLET_ADDRESS = '7557YaCZKQBdNSqDhpXFexJ3VpJLVvbK3zxcnqkFykXcxk7VomyiUh6';
  const API_KEY = 'SlfkgK63EJtLJHn2aXYztjzPkCUAGOuOZ7FivhlWtDc';
  const NOCKBLOCKS_URL = 'https://nockblocks.com/rpc/v1';

  try {
    const response = await fetch(NOCKBLOCKS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'getNotesByAddress',
        params: {
          address: WALLET_ADDRESS,
          showSpent: false
        },
        id: 1
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'RPC Error');
    }

    const notes = data.result || [];
    const totalBalance = notes.reduce((sum, note) => sum + (note.amount || 0), 0);

    res.status(200).json({
      success: true,
      address: WALLET_ADDRESS,
      balance: totalBalance,
      noteCount: notes.length,
      notes: notes,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
