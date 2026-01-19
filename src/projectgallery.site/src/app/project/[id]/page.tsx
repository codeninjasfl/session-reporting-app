import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import BeltBadge from '@/components/BeltBadge';
import ReportModal from '@/components/ReportModal';
import { supabase, getPublicUrl } from '@/lib/supabase';
import { Project } from '@/lib/types';
import { decodeMakeCodePng } from '@/lib/pxt-utils';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const addLog = (msg: string) => {
        console.log(msg);
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
    };

    // Editor embed states
    const [projectLoading, setProjectLoading] = useState(false);
    const [projectLoaded, setProjectLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const isImportingRef = useRef(false);
    const retryCountRef = useRef(0);
    const simulatorStartedRef = useRef(false);
    const maxRetries = 3;

    useEffect(() => {
        setIsMobile(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }, []);

    // Helper function to reload the iframe
    const reloadIframe = useCallback(() => {
        if (retryCountRef.current >= maxRetries) {
            console.log('❌ Max retries reached. Please try refreshing the page manually.');
            setLoadError('Game failed to load. Please try refreshing the page.');
            return;
        }

        retryCountRef.current++;
        console.log(`🔄 Reloading game... (attempt ${retryCountRef.current}/${maxRetries})`);

        // Reset states
        setProjectLoaded(false);
        setProjectLoading(false);
        isImportingRef.current = false;
        simulatorStartedRef.current = false;

        // Force iframe reload
        const iframe = iframeRef.current;
        if (iframe) {
            const currentSrc = iframe.src;
            iframe.src = '';
            setTimeout(() => {
                iframe.src = currentSrc;
            }, 100);
        }
    }, []);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data = event.data;
            if (!data) return;

            if (data.type === 'pxteditor' || data.type === 'pxthost') {
                // Ignore noisy event logs
                if (data.type === 'pxteditor' && data.action === 'event') {
                    return;
                }

                // Detect simulator state changes
                if (data.type === 'pxthost' && data.action === 'simstate') {
                    if (data.state === 'running' || data.state === 'paused') {
                        console.log('🎮 Simulator is running!');
                        simulatorStartedRef.current = true;
                    }
                }

                // Detect compile errors or crashes - keep this as it's directly from the host
                if (data.type === 'pxthost' && (data.action === 'workspaceerror' || data.action === 'runtimeerror')) {
                    console.log('❌ Host reported fatal error:', data);
                    // No automated reload - let user refresh or see if it recovers
                    return;
                }

                if (data.type === 'pxteditor' && data.action === 'ready') {
                    console.log('✅ Editor reported READY!');
                }

                if (data.type === 'pxteditor' && data.id && projectLoading) {
                    console.log('✅ Received response for import: ' + JSON.stringify(data));
                    setProjectLoaded(true);
                    setProjectLoading(false);
                    isImportingRef.current = false;
                    simulatorStartedRef.current = false;

                    console.log('✅ Import complete. Game will start when ready.');
                }
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [projectLoaded]);

    // URL for the iframe - enforces a unique workspace per project ID
    const iframeUrl = useMemo(() => {
        if (!project) return '';
        if (project.title === 'Road To Becoming Champion') {
            return 'https://tsrray.github.io/road-to-becoming-champion-final/';
        }
        // Use projectId as workspace ID to keep it distinct per project but stable across reloads
        // We removed the random session ID because it was causing Service Worker crashes (too many workspace DBs)
        return `https://arcade.makecode.com/?controller=1&ws=${projectId}&nologin=1`;
    }, [projectId, project?.title]);

    // State for coordination
    const [projectCode, setProjectCode] = useState<any>(null);
    const [editorReady, setEditorReady] = useState(false);
    const [importSent, setImportSent] = useState(false);

    // 1. Fetch and Decode Project Data
    useEffect(() => {
        if (!project || project.title === 'Road To Becoming Champion') return;

        let active = true;
        const prepareCode = async () => {
            // Avoid double-fetching if we already have code for this project
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

    // 2. Listen for Editor Events and Trigger Import
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data = event.data;
            if (!data) return;

            if (data.type === 'pxteditor') {
                if (data.action === 'ready') {
                    console.log('✅ Editor reported READY!');
                    setEditorReady(true);
                }

                // Import success confirmation
                if (data.action === 'importproject' && data.success) { // Some editors reply with success: true
                    console.log('✅ Import confirmed by editor');
                    // Now start the simulator
                    if (iframeRef.current && iframeRef.current.contentWindow) {
                        console.log('▶️ Starting Simulator...');
                        iframeRef.current.contentWindow.postMessage({
                            type: 'pxteditor',
                            action: 'startsimulator'
                        }, '*');
                    }
                }
                // Standard response with ID matching our request
                if (data.id && isImportingRef.current) {
                    // Check if this matches our import ID?
                    // For now, assume any response with ID while importing is our success
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
                    // Taking this as a sign of success too
                    setProjectLoaded(true);
                    setProjectLoading(false);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [projectLoaded]);

    // 3. Coordinate the Import
    useEffect(() => {
        // Only run if we have everything needed and haven't finished yet
        if (!projectCode || !editorReady || importSent || projectLoaded || !iframeRef.current) return;

        // Use a ref to prevent double-firing in strict mode
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

            // Send repeatedly until success or timeout
            let attempts = 0;
            const maxAttempts = 20; // Try for 10 seconds (2 per second)

            const sender = setInterval(() => {
                // Stop if:
                // 1. Iframe is gone
                // 2. We reached max attempts
                // 3. Import marked as finished (isImportingRef is false)
                if (!iframe.contentWindow || attempts >= maxAttempts || !isImportingRef.current) {
                    clearInterval(sender);

                    // If we stopped due to timeout AND we're presumably still trying (ref is true)
                    // (Note: we check attempts first to distinguish timeout from success)
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

    // Reset loop if project changes (extra safety) -> Actually handled by the reset effect in previous block

    // Empty load handler (logic moved to effects)
    const handleIframeLoad = () => {
        console.log('🖼️ Iframe loaded (waiting for ready signal)');

        // Force ready state after a short delay if we don't hear back
        // This fixes race conditions where "ready" fires before listeners are active
        setTimeout(() => {
            setEditorReady(prev => {
                if (!prev) {
                    console.log('⚠️ No ready signal received within 1.5s. Forcing ready state...');
                    return true;
                }
                return prev;
            });
        }, 1500);
    };

    useEffect(() => {
        // Reset state immediately when switching projects
        setProject(null);
        setProjectLoaded(false);
        setProjectLoading(false);
        isImportingRef.current = false;
        setProjectCode(null); // Reset project code
        setEditorReady(false); // Reset editor ready state
        setImportSent(false); // Reset import sent state

        fetchProject();

        const channel = supabase
            .channel(`project-${projectId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'projects',
                    filter: `id=eq.${projectId}`,
                },
                (payload) => {
                    setProject(payload.new as Project);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [projectId]);

    async function fetchProject() {
        setLoading(true);

        const { data, error: fetchError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (fetchError) {
            setError('Project not found');
        } else {
            // Reset editor states for the new project
            setProject(data);
            setProjectLoaded(false);
            setProjectLoading(false);
            isImportingRef.current = false;
            setProjectCode(null); // Reset project code
            setEditorReady(false); // Reset editor ready state
            setImportSent(false); // Reset import sent state

            supabase
                .from('projects')
                .update({ views: (data.views || 0) + 1 })
                .eq('id', projectId)
                .then();
        }
        setLoading(false);
    }

    // Fullscreen logic
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

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

    // Prevent rendering stale data if the URL ID doesn't match the state ID
    if (loading || (project && project.id !== projectId)) {
        return (
            <>
                <Header />
                <div className="project-detail">
                    <div className="card glass-card" style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="spinner" />
                        <p>Loading...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error || !project) {
        return (
            <>
                <Header />
                <div className="project-detail">
                    <div className="card glass-card" style={{ textAlign: 'center', padding: '60px' }}>
                        <h2>Project Not Found</h2>
                        <Link href="/gallery" className="btn primary">Browse Gallery</Link>
                    </div>
                </div>
            </>
        );
    }

    const imageUrl = getPublicUrl(project.png_path);
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <>
            <Header />

            <div className="project-detail w-full">
                <AnimateOnScroll delay={100}>
                    {/* 1. Header Info & Description */}
                    <div className="info glass-card" style={{ marginBottom: '32px' }}>
                        <div className="title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <h1>{project.title}</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                                    <BeltBadge belt={project.belt} />
                                </div>
                            </div>

                            <a
                                href={imageUrl}
                                download={`${project.title.replace(/\s+/g, '_')}_arcade.png`}
                                className="btn"
                                style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <span>⬇️</span> Download Game File
                            </a>
                        </div>

                        <p className="creator">
                            Created by <strong>{project.creator_name}</strong> at Code Ninjas <strong>{project.location}</strong>
                        </p>

                        {project.description && (
                            <p className="description" style={{ fontSize: '1.1rem', lineHeight: '1.6', marginTop: '16px' }}>
                                {project.description}
                            </p>
                        )}
                    </div>
                </AnimateOnScroll>

                {/* 2. Embedded Editor / Game */}
                {project.status === 'ready' && !isMobile && (
                    <AnimateOnScroll delay={200}>
                        <div style={{ marginBottom: '32px' }}>
                            <div
                                ref={containerRef}
                                style={{
                                    position: 'relative',
                                    // Aspect Ratio 4:3 for taller view
                                    width: '100%',
                                    aspectRatio: isFullscreen ? 'auto' : '4/3',
                                    height: isFullscreen ? '100vh' : 'auto',
                                    background: '#1e1e1e',
                                    borderRadius: isFullscreen ? '0' : '16px',
                                    overflow: 'hidden',
                                    // Fix border shorthand mix
                                    borderWidth: isFullscreen ? '0' : '2px',
                                    borderStyle: 'solid',
                                    borderColor: '#22c55e',
                                    boxShadow: isFullscreen ? 'none' : '0 20px 40px -10px rgba(0,0,0,0.5)'
                                }}>

                                {/* Loading Overlay */}
                                {(!projectLoaded && !loadError) && (
                                    <div style={{
                                        position: 'absolute',
                                        zIndex: 10,
                                        inset: 0,
                                        background: '#1e1e1e', // Solid background to hide cached state
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <div className="spinner" style={{ width: '40px', height: '40px', marginBottom: '16px' }} />
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
                                        <button
                                            onClick={reloadIframe}
                                            className="btn"
                                            style={{ padding: '8px 16px', fontSize: '14px' }}
                                        >
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

                                {/* Internal Exit Fullscreen Button (Visible only in Fullscreen) */}
                                {isFullscreen && (
                                    <button
                                        onClick={toggleFullscreen}
                                        style={{
                                            position: 'absolute',
                                            top: '20px',
                                            right: '25px',
                                            zIndex: 100, // Ensure it's on top of standard z-index
                                            background: 'white',
                                            color: '#0f172a',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '10px 20px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <span>✕</span> Exit Fullscreen
                                    </button>
                                )}
                            </div>

                            {/* External Fullscreen Button */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', position: 'relative', zIndex: 5 }}>
                                <button
                                    onClick={toggleFullscreen}
                                    className="btn"
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: '1rem',
                                        background: '#ffffff', // White
                                        color: '#0f172a', // Dark text
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        fontWeight: 600
                                    }}
                                >
                                    <span style={{ fontSize: '18px' }}>⛶</span>
                                    <span>Fullscreen</span>
                                </button>
                            </div>
                        </div>
                    </AnimateOnScroll>
                )}

                {/* Mobile Notice */}
                {project.status === 'ready' && isMobile && (
                    <AnimateOnScroll delay={200}>
                        <div style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ color: '#fff' }}>Visit on Desktop to Play</h3>
                        </div>
                    </AnimateOnScroll>
                )}
            </div>

            {showReport && project && (
                <ReportModal
                    projectId={projectId}
                    projectTitle={project.title}
                    onClose={() => setShowReport(false)}
                />
            )}
        </>
    );
}
