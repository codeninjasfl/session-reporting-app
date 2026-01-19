import Link from 'next/link';
import { AnimateOnScroll } from './AnimateOnScroll';

export default function Header() {
    return (
        <header className="header container">
            <AnimateOnScroll delay={0} bleed className="w-full flex items-center justify-between">
                <Link href="/" className="brand">
                    <img
                        className="logo"
                        src="https://www.codeninjas.com/hubfs/Group%201.svg"
                        alt="Code Ninjas"
                    />
                    <span className="title">IMPACT Gallery</span>
                </Link>
                <nav>
                    <Link href="/gallery">Gallery</Link>
                </nav>
            </AnimateOnScroll>
        </header>
    );
}
