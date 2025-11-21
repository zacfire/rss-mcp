export default function Home() {
  return (
    <main style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      lineHeight: '1.6'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>RSS MCP Server</h1>

      <p style={{ color: '#666', marginBottom: '30px' }}>
        A Model Context Protocol (MCP) server for fetching and parsing RSS/Atom feeds with RSSHub support.
      </p>

      <section style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#333', marginTop: 0 }}>MCP Endpoint</h2>
        <code style={{
          display: 'block',
          backgroundColor: '#f4f4f4',
          padding: '15px',
          borderRadius: '4px',
          wordBreak: 'break-all'
        }}>
          {typeof window !== 'undefined' ? `${window.location.origin}/mcp` : '/mcp'}
        </code>
      </section>

      <section style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#333', marginTop: 0 }}>Available Tool</h2>

        <h3 style={{ color: '#555' }}>get_feed</h3>
        <p style={{ color: '#666' }}>
          Fetches and parses an RSS feed from a given URL. Supports both standard RSS/Atom feeds and RSSHub feeds.
        </p>

        <h4 style={{ color: '#555' }}>Parameters:</h4>
        <ul style={{ color: '#666' }}>
          <li>
            <strong>url</strong> (string, required): The URL of the RSS feed. Supports:
            <ul>
              <li>Standard URLs: <code>https://rsshub.app/bilibili/user/dynamic/208259</code></li>
              <li>rsshub:// protocol: <code>rsshub://bilibili/user/dynamic/208259</code></li>
              <li>Short paths: <code>bilibili/user/dynamic/208259</code></li>
            </ul>
          </li>
          <li>
            <strong>count</strong> (number, optional): Number of items to retrieve. Default: 1, Set to 0 for all items.
          </li>
        </ul>
      </section>

      <section style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#333', marginTop: 0 }}>Client Configuration</h2>

        <h3 style={{ color: '#555' }}>For Cursor</h3>
        <pre style={{
          backgroundColor: '#f4f4f4',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto'
        }}>
{`{
  "mcpServers": {
    "rss": {
      "url": "${typeof window !== 'undefined' ? window.location.origin : 'https://your-rss-mcp.vercel.app'}/mcp"
    }
  }
}`}
        </pre>

        <h3 style={{ color: '#555' }}>For Claude Desktop</h3>
        <pre style={{
          backgroundColor: '#f4f4f4',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto'
        }}>
{`{
  "mcpServers": {
    "rss": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "${typeof window !== 'undefined' ? window.location.origin : 'https://your-rss-mcp.vercel.app'}/mcp"
      ]
    }
  }
}`}
        </pre>
      </section>

      <section style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#333', marginTop: 0 }}>Features</h2>
        <ul style={{ color: '#666' }}>
          <li>Universal RSS/Atom feed parsing</li>
          <li>RSSHub multi-instance support with automatic failover</li>
          <li>Smart URL parsing (rsshub:// protocol)</li>
          <li>Customizable item count</li>
          <li>Content cleaning with plain text extraction</li>
          <li>Priority instance configuration via environment variable</li>
        </ul>
      </section>

      <footer style={{
        marginTop: '40px',
        textAlign: 'center',
        color: '#999',
        fontSize: '14px'
      }}>
        <p>
          <a
            href="https://github.com/zacfire/rss-mcp"
            style={{ color: '#666', textDecoration: 'none' }}
          >
            GitHub Repository
          </a>
          {' | '}
          <span>Apache-2.0 License</span>
        </p>
      </footer>
    </main>
  );
}
