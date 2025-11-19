import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RSS MCP Server',
  description: 'A Model Context Protocol server for fetching and parsing RSS/Atom feeds with RSSHub support',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        margin: 0,
        padding: 0,
        backgroundColor: '#f5f5f5'
      }}>
        {children}
      </body>
    </html>
  );
}
