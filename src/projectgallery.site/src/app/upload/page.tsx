import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Belt, Location, BELT_OPTIONS, LOCATION_OPTIONS } from '@/lib/types';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const [creatorName, setCreatorName] = useState('');
    const [location, setLocation] = useState<Location>('Aventura');
    const [belt, setBelt] = useState<Belt>('white');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ id: string; title: string } | null>(null);

    function handleFileSelect(selectedFile: File) {
        // Validate file type
        if (!selectedFile.type.startsWith('image/png')) {
            setError('Please upload a PNG image');
            return;
        }

        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File too large. Maximum size is 10MB.');
            return;
        }

        setFile(selectedFile);
        setError(null);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(true);
    }

    function handleDragLeave() {
        setDragOver(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!file) {
            setError('Please select a PNG file');
            return;
        }

        if (!creatorName.trim() || !title.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Generate unique filename
            const timestamp = Date.now();
            const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

            // Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('project_pngs')
                .upload(filename, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            // Get the public URL for the uploaded PNG
            const { data: urlData } = supabase.storage
                .from('project_pngs')
                .getPublicUrl(filename);

            // Generate MakeCode import URL - uses importurl to create new project from PNG screenshot
            const makecodeUrl = `https://arcade.makecode.com/?importurl=${encodeURIComponent(urlData.publicUrl)}`;

            // Insert project record with ready status (no processing needed)
            const { data: project, error: insertError } = await supabase
                .from('projects')
                .insert({
                    creator_name: creatorName.trim(),
                    location,
                    belt,
                    title: title.trim(),
                    description: description.trim(),
                    png_path: filename,
                    status: 'ready',
                    makecode_url: makecodeUrl,
                })
                .select()
                .single();

            if (insertError) {
                throw new Error(`Failed to create project: ${insertError.message}`);
            }

            setSuccess({ id: project.id, title: project.title });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (success) {
        const shareUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/project/${success.id}`
            : '';

        return (
            <>
                <Header />
                <section className="container" style={{ padding: '60px 20px' }}>
                    <AnimateOnScroll delay={100}>
                        <div className="card glass-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                            <AnimateOnScroll delay={200}>
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                                <h1 style={{ color: 'var(--success)', marginBottom: '12px' }}>Project Uploaded!</h1>
                                <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
                                    Your game <strong>"{success.title}"</strong> is ready to share!
                                </p>
                            </AnimateOnScroll>

                            <AnimateOnScroll delay={300}>
                                <div className="share-box">
                                    <input
                                        type="text"
                                        readOnly
                                        value={shareUrl}
                                        onClick={(e) => (e.target as HTMLInputElement).select()}
                                    />
                                    <button
                                        className="btn primary"
                                        onClick={() => {
                                            navigator.clipboard.writeText(shareUrl);
                                            alert('Link copied!');
                                        }}
                                    >
                                        Copy
                                    </button>
                                </div>
                            </AnimateOnScroll>

                            <AnimateOnScroll delay={400}>
                                <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                    <button
                                        className="btn primary"
                                        onClick={() => router.push(`/project/${success.id}`)}
                                    >
                                        View Project
                                    </button>
                                    <button
                                        className="btn"
                                        onClick={() => {
                                            setSuccess(null);
                                            setFile(null);
                                            setPreview(null);
                                            setCreatorName('');
                                            setTitle('');
                                            setDescription('');
                                        }}
                                    >
                                        Upload Another
                                    </button>
                                </div>
                            </AnimateOnScroll>
                        </div>
                    </AnimateOnScroll>
                </section>
            </>
        );
    }

    return (
        <>
            <Header />

            <section className="container" style={{ padding: '40px 20px' }}>
                <AnimateOnScroll delay={100}>
                    <div className="card glass-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>Upload Your Project</h1>
                        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '32px' }}>
                            Share your IMPACT MakeCode Arcade game with the world!
                        </p>

                        <form onSubmit={handleSubmit}>
                            {/* File Upload Zone */}
                            <AnimateOnScroll delay={200}>
                                <div
                                    className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {preview ? (
                                        <div className="fade-in">
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '200px',
                                                    borderRadius: '12px',
                                                    marginBottom: '12px'
                                                }}
                                            />
                                            <p style={{ color: 'var(--success)', fontWeight: 600 }}>
                                                ✓ {file?.name}
                                            </p>
                                            <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                                                Click to change
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="icon">📸</div>
                                            <h3>Drop your screenshot here</h3>
                                            <p>or click to browse (PNG only, max 10MB)</p>
                                        </>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleFileSelect(f);
                                        }}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </AnimateOnScroll>

                            {/* Form Fields */}
                            <div style={{ marginTop: '24px' }}>
                                <AnimateOnScroll delay={300}>
                                    <div className="form-group">
                                        <label>Your Name *</label>
                                        <input
                                            type="text"
                                            placeholder="First name or nickname"
                                            value={creatorName}
                                            onChange={(e) => setCreatorName(e.target.value)}
                                            maxLength={50}
                                            required
                                        />
                                        <p className="hint">👤 First name or nickname only - no last names please!</p>
                                    </div>
                                </AnimateOnScroll>

                                <AnimateOnScroll delay={400}>
                                    <div className="form-group">
                                        <label>Your Location *</label>
                                        <select
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value as Location)}
                                            required
                                        >
                                            {LOCATION_OPTIONS.map((loc) => (
                                                <option key={loc} value={loc}>
                                                    Code Ninjas {loc}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="hint">📍 Which Code Ninjas location do you attend?</p>
                                    </div>
                                </AnimateOnScroll>

                                <AnimateOnScroll delay={500}>
                                    <div className="form-group">
                                        <label>Your Belt *</label>
                                        <select
                                            value={belt}
                                            onChange={(e) => setBelt(e.target.value as Belt)}
                                            required
                                        >
                                            {BELT_OPTIONS.map((b) => (
                                                <option key={b} value={b} style={{ textTransform: 'capitalize' }}>
                                                    {b.charAt(0).toUpperCase() + b.slice(1)} Belt
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </AnimateOnScroll>

                                <AnimateOnScroll delay={600}>
                                    <div className="form-group">
                                        <label>Project Title *</label>
                                        <input
                                            type="text"
                                            placeholder="What's your game called?"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            maxLength={100}
                                            required
                                        />
                                    </div>
                                </AnimateOnScroll>

                                <AnimateOnScroll delay={700}>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            placeholder="Tell us about your game..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            maxLength={500}
                                            rows={3}
                                        />
                                    </div>
                                </AnimateOnScroll>
                            </div>

                            {error && (
                                <div className="fade-in" style={{
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    marginBottom: '20px',
                                    fontSize: '14px'
                                }}>
                                    ❌ {error}
                                </div>
                            )}

                            <AnimateOnScroll delay={800}>
                                <button
                                    type="submit"
                                    className="btn primary"
                                    style={{ width: '100%' }}
                                    disabled={isSubmitting || !file}
                                >
                                    {isSubmitting ? '⏳ Uploading...' : '🚀 Upload Project'}
                                </button>
                            </AnimateOnScroll>

                            <AnimateOnScroll delay={900} bleed>
                                <p style={{
                                    textAlign: 'center',
                                    color: 'var(--muted)',
                                    fontSize: '12px',
                                    marginTop: '16px'
                                }}>
                                    By uploading, you agree to share your project in the gallery.
                                    No personal information other than your first name will be shown.
                                </p>
                            </AnimateOnScroll>
                        </form>
                    </div>
                </AnimateOnScroll>
            </section>
        </>
    );
}
