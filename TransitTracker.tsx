import React, { useState, useEffect } from 'react';

export default function TransitTracker() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  // NOTE: Original TSX version - requires Anthropic API key.
  // See index.html for the no-API phone-ready version.

  const calculateTransits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add: 'x-api-key': process.env.ANTHROPIC_API_KEY
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: 'Calculate current planetary transits as JSON.' }]
        })
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error.message || 'API error');
      const textContent = result.content.filter((item: any) => item.type === 'text').map((item: any) => item.text).join('');
      if (!textContent) throw new Error('No text content in response');
      let jsonText = textContent.trim();
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      jsonText = jsonText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      const transitData = JSON.parse(jsonText);
      setData(transitData);
      setTimestamp(new Date().toLocaleString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { calculateTransits(); }, []);

  return (
    <div>
      {loading && <p>Calculating planetary positions...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {timestamp && <p>Last updated: {timestamp}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
