// Vercel Serverless Function - API Proxy for NockBlocks
// This keeps your API key secure on the server

const NOCKBLOCKS_API_URL = 'https://nockblocks.com/rpc/v1';
const API_KEY = 'SlfkgK63EJtLJHn2aXYztjzPkCUAGOuOZ7FivhlWtDc';
const WALLET_ADDRESS = '7557YaCZKQBdNSqDhpXFexJ3VpJLVvbK3zxcnqkFykXcxk7VomyiUh6';

module.exports = async (req, res) => {
  // Enable CORS for your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Call NockBlocks API using JSON-RPC
    const response = await fetch(NOCKBLOCKS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'getNotesByAddress',
        params: [{
          address: WALLET_ADDRESS,
          showSpent: false  // Only show unspent notes
        }],
        id: 1
      })
    });

    if (!response.ok) {
      throw new Error(`NockBlocks API returned ${response.status}`);
    }

    const data = await response.json();

    // Check for JSON-RPC error
    if (data.error) {
      res.status(400).json({ 
        error: 'API Error', 
        message: data.error.message,
        details: data.error.data 
      });
      return;
    }

    // Calculate total balance from notes
    const notes = data.result || [];
    const totalBalance = notes.reduce((sum, note) => sum + (note.assets || 0), 0);

    // Return formatted data
    res.status(200).json({
      success: true,
      address: WALLET_ADDRESS,
      balance: totalBalance,
      noteCount: notes.length,
      notes: notes,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching wallet data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet data',
      message: error.message 
    });
  }
};
