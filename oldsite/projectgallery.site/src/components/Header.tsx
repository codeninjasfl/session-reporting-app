import Link from 'next/link';

export default function Header() {
    return (
        <header className="header container">
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
                <Link href="/upload">Upload</Link>
            </nav>
        </header>
    );
}
