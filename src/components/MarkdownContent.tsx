'use client'

import ReactMarkdown from 'react-markdown'

interface MarkdownContentProps {
    content: string
    className?: string
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
    return (
        <div className={`prose prose-sm max-w-none ${className}`}>
            <ReactMarkdown
                components={{
                    // Links open in new tab
                    a: ({ node, ...props }) => (
                        <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--brand)] hover:underline font-medium"
                        />
                    ),
                    // Bold text
                    strong: ({ node, ...props }) => (
                        <strong {...props} className="font-bold text-gray-900" />
                    ),
                    // Italic text
                    em: ({ node, ...props }) => (
                        <em {...props} className="italic" />
                    ),
                    // Images
                    img: ({ node, ...props }) => (
                        <img
                            {...props}
                            className="rounded-lg max-w-full h-auto my-2 shadow-md"
                            loading="lazy"
                        />
                    ),
                    // Paragraphs
                    p: ({ node, ...props }) => (
                        <p {...props} className="text-gray-700 leading-relaxed my-2" />
                    ),
                    // Lists
                    ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc list-inside my-2 text-gray-700" />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol {...props} className="list-decimal list-inside my-2 text-gray-700" />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
