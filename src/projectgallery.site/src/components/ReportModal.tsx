import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AnimateOnScroll } from './AnimateOnScroll';

interface ReportModalProps {
    projectId: string;
    projectTitle: string;
    onClose: () => void;
}

export default function ReportModal({ projectId, projectTitle, onClose }: ReportModalProps) {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setIsSubmitting(true);

        try {
            await supabase.from('reports').insert({
                project_id: projectId,
                reason,
                details,
            });
            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting report:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)', transition: 'all 0.3s ease' }}>
                <AnimateOnScroll delay={0}>
                    <div className="card glass-card" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ color: 'var(--success)', marginBottom: '12px' }}>✓ Report Submitted</h3>
                        <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
                            Thank you for helping keep our gallery safe!
                        </p>
                        <button className="btn primary" onClick={onClose}>Close</button>
                    </div>
                </AnimateOnScroll>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)', transition: 'all 0.3s ease' }}>
            <AnimateOnScroll delay={0}>
                <div className="card glass-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
                    <h3 style={{ marginBottom: '16px' }}>Report Project</h3>
                    <p style={{ color: 'var(--muted)', marginBottom: '20px', fontSize: '14px' }}>
                        Reporting: <strong>{projectTitle}</strong>
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Reason for Report *</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            >
                                <option value="">Select a reason...</option>
                                <option value="inappropriate">Inappropriate content</option>
                                <option value="personal_info">Contains personal information</option>
                                <option value="spam">Spam or duplicate</option>
                                <option value="not_impact">Not an IMPACT project</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Additional Details (optional)</label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Tell us more..."
                                rows={3}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn primary" disabled={isSubmitting || !reason}>
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </div>
            </AnimateOnScroll>
            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
