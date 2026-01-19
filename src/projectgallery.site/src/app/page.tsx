import Link from 'next/link';
import Header from '@/components/Header';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

export default async function Home() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="hero">
        <AnimateOnScroll delay={100}>
          <h1>Share Your IMPACT Creations</h1>
        </AnimateOnScroll>
        <AnimateOnScroll delay={200}>
          <p>
            Upload your MakeCode Arcade games and show the world what you've built!
            Every ninja's game deserves to be played.
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll delay={300}>
          <div className="hero-buttons">
            <Link href="/upload" className="btn primary">
              🚀 Upload Project
            </Link>
            <Link href="/gallery" className="btn">
              🎮 Browse Gallery
            </Link>
          </div>
        </AnimateOnScroll>
      </section>

      {/* How It Works */}
      <section className="container" style={{ padding: '40px 20px' }}>
        <AnimateOnScroll delay={400}>
          <div className="card glass-card" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', color: 'var(--brand)' }}>How It Works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <AnimateOnScroll delay={500}>
                <div>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📸</div>
                  <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>1. Take a Screenshot</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                    In IMPACT, use the special screenshot to capture your game code
                  </p>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={600}>
                <div>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>⬆️</div>
                  <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>2. Upload Here</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                    Drop your PNG and add your name and project details
                  </p>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={700}>
                <div>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎮</div>
                  <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>3. Share & Play</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                    Get a shareable link so anyone can play your game!
                  </p>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Footer */}
      <footer className="footer">
        <AnimateOnScroll delay={800} bleed>
          <p>Made with ❤️ at Code Ninjas FL</p>
          <p style={{ marginTop: '8px', fontSize: '12px' }}>
            Powered by IMPACT & MakeCode Arcade
          </p>
        </AnimateOnScroll>
      </footer>
    </>
  );
}
