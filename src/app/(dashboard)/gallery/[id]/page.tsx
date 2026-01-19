'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LucideArrowLeft, LucideExternalLink, LucideShare2, LucideMapPin, LucideEye, LucideMaximize2, LucideX, LucideDownload } from 'lucide-react';
import BeltBadge from '@/components/gallery/BeltBadge';
import { gallerySupabase, getPublicUrl } from '@/lib/gallery-supabase';
import { Project } from '@/lib/gallery-types';
import { decodeMakeCodePng } from '@/lib/pxt-utils';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Editor embed states
    const [projectLoading, setProjectLoading] = useState(false);
    const [projectLoaded, setProjectLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const isImportingRef = useRef(false);
    const retryCountRef = useRef(0);
    const simulatorStartedRef = useRef(false);
    const maxRetries = 3;

    // State for coordination
    const [projectCode, setProjectCode] = useState<any>(null);
    const [editorReady, setEditorReady] = useState(false);
    const [importSent, setImportSent] = useState(false);

    // Fullscreen
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        setIsMobile(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }, []);

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    async function fetchProject() {
        setLoading(true);
        setError(null);
        // Reset embed states
        setProjectLoaded(false);
        setProjectLoading(false);
        isImportingRef.current = false;
        setProjectCode(null);
        setEditorReady(false);
        setImportSent(false);

        const { data, error: fetchError } = await gallerySupabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (fetchError) {
            setError('Project not found');
        } else {
            setProject(data);
            // Increment view count
            gallerySupabase
                .from('projects')
                .update({ views: (data.views || 0) + 1 })
                .eq('id', projectId)
                .then();
        }
        setLoading(false);
    }

    // Check if project has a custom embed URL (like GitHub Pages)
    const hasCustomEmbed = Boolean(project?.embed_url);

    // URL for the iframe
    const iframeUrl = useMemo(() => {
        if (!project) return '';
        // Use custom embed URL if available (e.g., GitHub Pages hosted game)
        if (project.embed_url) {
            return project.embed_url;
        }
        // Otherwise use MakeCode Arcade editor for PNG import
        return `https://arcade.makecode.com/?controller=1&ws=${projectId}&nologin=1`;
    }, [projectId, project?.embed_url]);

    // Fetch and Decode Project Data (skip if using custom embed URL)
    useEffect(() => {
        if (!project || hasCustomEmbed) return;

        let active = true;
        const prepareCode = async () => {
            if (projectCode?.header?.name === project.title) return;

            setLoadError(null);
            try {
                const imageUrl = getPublicUrl(project.png_path);
                const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}&t=${Date.now()}`;

                console.log('🔍 Fetching image code...');
                const data = await decodeMakeCodePng(proxyUrl);
                if (active) {
                    console.log('✅ Code decoded successfully');
                    setProjectCode(data);
                }
            } catch (err: any) {
                if (active) {
                    console.error('Failed to decode:', err);
                    setLoadError('Failed to load game file.');
                }
            }
        };

        setProjectCode(null);
        setEditorReady(false);
        setImportSent(false);
        prepareCode();

        return () => { active = false; };
    }, [project, projectId]);

    // Listen for Editor Events (skip if using custom embed URL)
    useEffect(() => {
        // For custom embeds, mark as loaded immediately
        if (hasCustomEmbed) {
            setProjectLoaded(true);
            return;
        }

        const handleMessage = (event: MessageEvent) => {
            const data = event.data;
            if (!data) return;

            if (data.type === 'pxteditor') {
                if (data.action === 'ready') {
                    console.log('✅ Editor reported READY!');
                    setEditorReady(true);
                }

                if (data.id && isImportingRef.current) {
                    if (!projectLoaded) {
                        console.log('✅ Editor processed import command');
                        setProjectLoaded(true);
                        setProjectLoading(false);
                        isImportingRef.current = false;
                    }
                }
            }

            if (data.type === 'pxthost' && data.action === 'simstate') {
                if (data.state === 'running' || data.state === 'paused') {
                    simulatorStartedRef.current = true;
                    setProjectLoaded(true);
                    setProjectLoading(false);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [projectLoaded, hasCustomEmbed]);

    // Coordinate the Import
    useEffect(() => {
        if (!projectCode || !editorReady || importSent || projectLoaded || !iframeRef.current) return;
        if (isImportingRef.current) return;
        isImportingRef.current = true;

        const performImport = async () => {
            console.log('🚀 Starting Import Sequence...');
            setProjectLoading(true);
            setImportSent(true);

            const iframe = iframeRef.current;
            if (!iframe || !iframe.contentWindow) return;

            const importId = Math.random().toString();
            const importMessage = {
                type: 'pxteditor',
                action: 'importproject',
                id: importId,
                project: {
                    header: {
                        target: 'arcade',
                        targetVersion: projectCode.header?.targetVersion || '0.0.0',
                        name: project!.title,
                        meta: {},
                        editor: 'blocksprj',
                        pubId: '',
                        pubCurrent: false,
                        id: `${projectId}-${Date.now()}`,
                        recentUse: Date.now(),
                        modificationTime: Date.now(),
                        path: project!.title,
                    },
                    text: projectCode.text
                },
                response: true
            };

            let attempts = 0;
            const maxAttempts = 20;

            const sender = setInterval(() => {
                if (!iframe.contentWindow || attempts >= maxAttempts || !isImportingRef.current) {
                    clearInterval(sender);
                    if (attempts >= maxAttempts && isImportingRef.current) {
                        console.error('❌ Import timed out');
                        setLoadError('Game loading timed out.');
                        setProjectLoading(false);
                        isImportingRef.current = false;
                    }
                    return;
                }

                console.log(`📤 Sending import... (${attempts + 1})`);
                iframe.contentWindow.postMessage(importMessage, '*');
                attempts++;
            }, 500);
        };

        performImport();
    }, [projectCode, editorReady, importSent, projectLoaded, projectId, project]);

    const handleIframeLoad = () => {
        // For custom embeds, mark as loaded immediately
        if (hasCustomEmbed) {
            console.log('🖼️ Custom embed iframe loaded');
            setProjectLoaded(true);
            return;
        }

        console.log('🖼️ Iframe loaded (waiting for ready signal)');
        setTimeout(() => {
            setEditorReady(prev => {
                if (!prev) {
                    console.log('⚠️ No ready signal received. Forcing ready state...');
                    return true;
                }
                return prev;
            });
        }, 1500);
    };

    const reloadIframe = useCallback(() => {
        if (retryCountRef.current >= maxRetries) {
            setLoadError('Game failed to load. Please try refreshing the page.');
            return;
        }

        retryCountRef.current++;
        setProjectLoaded(false);
        setProjectLoading(false);
        isImportingRef.current = false;
        simulatorStartedRef.current = false;

        const iframe = iframeRef.current;
        if (iframe) {
            const currentSrc = iframe.src;
            iframe.src = '';
            setTimeout(() => { iframe.src = currentSrc; }, 100);
        }
    }, []);

    // Fullscreen handling
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    function copyShareLink() {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto animate-in fade-in pb-12">
                <div className="cn-card text-center py-16">
                    <div className="w-10 h-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading project...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="max-w-4xl mx-auto animate-in fade-in pb-12">
                <div className="cn-card text-center py-16">
                    <div className="text-5xl mb-4">🎮</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
                    <Link href="/gallery" className="btn primary">
                        Browse Gallery
                    </Link>
                </div>
            </div>
        );
    }

    const imageUrl = getPublicUrl(project.png_path);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-semibold"
            >
                <LucideArrowLeft className="h-5 w-5" />
                Back to Gallery
            </button>

            {/* Project Info Card */}
            <div className="cn-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">{project.title}</h1>
                        <div className="flex items-center gap-3 flex-wrap">
                            <BeltBadge belt={project.belt} />
                            <span className="text-gray-600 font-medium">
                                by <strong>{project.creator_name}</strong>
                            </span>
                            <span className="flex items-center gap-1 text-gray-500 text-sm">
                                <LucideMapPin className="h-4 w-4" />
                                {project.location}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full text-sm">
                        <LucideEye className="h-4 w-4" />
                        <span className="font-semibold">{project.views || 0}</span>
                    </div>
                </div>

                {project.description && (
                    <p className="text-gray-700 mb-4">{project.description}</p>
                )}

                <div className="flex flex-wrap gap-2">
                    <a
                        href={imageUrl}
                        download={`${project.title.replace(/\s+/g, '_')}_arcade.png`}
                        className="btn flex items-center gap-2 text-sm"
                    >
                        <LucideDownload className="h-4 w-4" />
                        Download PNG
                    </a>
                    <button onClick={copyShareLink} className="btn flex items-center gap-2 text-sm">
                        <LucideShare2 className="h-4 w-4" />
                        {copied ? 'Copied!' : 'Share'}
                    </button>
                </div>
            </div>

            {/* Game Embed */}
            {project.status === 'ready' && !isMobile && (
                <div>
                    <div
                        ref={containerRef}
                        style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: isFullscreen ? 'auto' : '4/3',
                            height: isFullscreen ? '100vh' : 'auto',
                            background: '#1e1e1e',
                            borderRadius: isFullscreen ? '0' : '20px',
                            overflow: 'hidden',
                            border: isFullscreen ? 'none' : '2px solid #22c55e',
                            boxShadow: isFullscreen ? 'none' : '0 20px 40px -10px rgba(0,0,0,0.5)'
                        }}
                    >
                        {/* Loading Overlay */}
                        {(!projectLoaded && !loadError) && (
                            <div style={{
                                position: 'absolute',
                                zIndex: 10,
                                inset: 0,
                                background: '#1e1e1e',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
                                <p style={{ color: 'white', fontWeight: 600 }}>Loading Game...</p>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>This may take a moment...</p>
                            </div>
                        )}

                        {/* Error Overlay */}
                        {loadError && (
                            <div style={{
                                position: 'absolute',
                                zIndex: 10,
                                inset: 0,
                                background: '#1e1e1e',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '16px'
                            }}>
                                <p style={{ color: '#ef4444', fontWeight: 600 }}>{loadError}</p>
                                <button onClick={reloadIframe} className="btn">
                                    Try Again
                                </button>
                            </div>
                        )}

                        <iframe
                            key={projectId}
                            ref={iframeRef}
                            onLoad={handleIframeLoad}
                            src={iframeUrl}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title="MakeCode Arcade"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads"
                            allow="clipboard-read; clipboard-write; camera; microphone; gamepad; autoplay *; usb; serial"
                            allowFullScreen={true}
                        />

                        {/* Exit Fullscreen Button */}
                        {isFullscreen && (
                            <button
                                onClick={toggleFullscreen}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '25px',
                                    zIndex: 100,
                                    background: 'white',
                                    color: '#0f172a',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '10px 20px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <LucideX className="h-4 w-4" /> Exit Fullscreen
                            </button>
                        )}
                    </div>

                    {/* Fullscreen Button */}
                    <div className="flex justify-end mt-3">
                        <button onClick={toggleFullscreen} className="btn flex items-center gap-2">
                            <LucideMaximize2 className="h-4 w-4" />
                            Fullscreen
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Notice */}
            {project.status === 'ready' && isMobile && (
                <div className="cn-card p-6 text-center bg-gradient-to-r from-blue-500 to-blue-600">
                    <h3 className="text-white font-bold text-lg">📱 Visit on Desktop to Play</h3>
                    <p className="text-white/80 mt-2">MakeCode Arcade games work best on a computer.</p>
                </div>
            )}

            {/* Processing State */}
            {project.status === 'processing' && (
                <div className="cn-card p-6 text-center bg-amber-50">
                    <div className="w-10 h-10 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
                    <h3 className="font-bold text-amber-800">Building your game...</h3>
                    <p className="text-amber-600 text-sm">This usually takes less than a minute.</p>
                </div>
            )}
        </div>
    );
}
