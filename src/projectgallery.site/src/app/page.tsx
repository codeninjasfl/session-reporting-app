import Link from 'next/link';
import Header from '@/components/Header';

export default async function Home() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="hero">
        <h1>Share Your IMPACT Creations</h1>
        <p>
          Upload your MakeCode Arcade games and show the world what you've built!
          Every ninja's game deserves to be played.
        </p>
        <div className="hero-buttons">
          <Link href="/upload" className="btn primary">
            🚀 Upload Project
          </Link>
          <Link href="/gallery" className="btn">
            🎮 Browse Gallery
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="container" style={{ padding: '40px 20px' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '24px', color: 'var(--brand)' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📸</div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>1. Take a Screenshot</h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                In IMPACT, use the special screenshot to capture your game code
              </p>
            </div>
            <div>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>⬆️</div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>2. Upload Here</h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                Drop your PNG and add your name and project details
              </p>
            </div>
            <div>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎮</div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>3. Share & Play</h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                Get a shareable link so anyone can play your game!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Made with ❤️ at Code Ninjas FL</p>
        <p style={{ marginTop: '8px', fontSize: '12px' }}>
          Powered by IMPACT & MakeCode Arcade
        </p>
      </footer>
    </>
  );
}
