'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { LucidePencil, LucideCircle, LucideType, LucideUndo, LucideTrash2, LucideSave } from 'lucide-react'

interface SessionCardEditorProps {
    beltColor: string
    studentName: string
    senseiName: string
    onSave: (imageDataUrl: string) => void
}

type Tool = 'pen' | 'circle' | 'text'

interface DrawAction {
    type: 'stroke' | 'circle' | 'text'
    data: any
}

export default function SessionCardEditor({
    beltColor,
    studentName,
    senseiName,
    onSave
}: SessionCardEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [tool, setTool] = useState<Tool>('pen')
    const [actions, setActions] = useState<DrawAction[]>([])
    const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([])
    const [textInput, setTextInput] = useState('')
    const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null)
    const [imageLoaded, setImageLoaded] = useState(false)
    const backgroundImageRef = useRef<HTMLImageElement | null>(null)

    const [fontSize, setFontSize] = useState(22)

    // Final coordinates locked in based on testing
    const ninjaX = 0.305
    const ninjaY = 0.145
    const senseiX = 0.315
    const senseiY = 0.19
    const dateX = 0.295
    const dateY = 0.235

    // Editable Sensei name (click to type)
    const [senseiNameInput, setSenseiNameInput] = useState('')

    // Get the correct template based on belt color
    const getTemplateUrl = useCallback(() => {
        const belt = beltColor?.toLowerCase() || 'white'
        return `/cards/${belt}-belt.png`
    }, [beltColor])

    // Redraw canvas with background and all actions
    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas || !backgroundImageRef.current) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw background template (cropped to single card - top-left quadrant)
        const srcWidth = backgroundImageRef.current.width / 2
        const srcHeight = backgroundImageRef.current.height / 2

        ctx.drawImage(
            backgroundImageRef.current,
            0, 0, srcWidth, srcHeight,  // Source: top-left quadrant
            0, 0, canvas.width, canvas.height  // Dest: full canvas (scaled)
        )

        // Draw student info overlay
        // Position relative to canvas size to handle scaling
        const scaleX = canvas.width / srcWidth
        const scaleY = canvas.height / srcHeight

        ctx.font = `bold ${fontSize * scaleX}px Inter, sans-serif`
        ctx.fillStyle = '#000'

        // Coordinates: Using adjustable state values
        ctx.fillText(studentName, canvas.width * ninjaX, canvas.height * ninjaY)
        // Sensei name (editable via input box)
        if (senseiNameInput) {
            ctx.fillText(senseiNameInput, canvas.width * senseiX, canvas.height * senseiY)
        }
        const formattedDate = new Date().toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit'
        })
        ctx.fillText(formattedDate, canvas.width * dateX, canvas.height * dateY)

        // Replay all actions
        actions.forEach(action => {
            if (action.type === 'stroke') {
                ctx.beginPath()
                ctx.strokeStyle = '#2563eb'
                ctx.lineWidth = 3
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
                action.data.forEach((point: { x: number; y: number }, i: number) => {
                    if (i === 0) ctx.moveTo(point.x, point.y)
                    else ctx.lineTo(point.x, point.y)
                })
                ctx.stroke()
            } else if (action.type === 'circle') {
                ctx.beginPath()
                ctx.strokeStyle = '#2563eb'
                ctx.lineWidth = 3
                // Scale circle radius too
                ctx.arc(action.data.x, action.data.y, 12 * Math.min(scaleX, scaleY), 0, Math.PI * 2)
                ctx.stroke()
            } else if (action.type === 'text') {
                ctx.font = `${14 * scaleX}px Inter, sans-serif`
                ctx.fillStyle = '#000'
                ctx.fillText(action.data.text, action.data.x, action.data.y)
            }
        })
    }, [actions, studentName, senseiNameInput, ninjaX, ninjaY, senseiX, senseiY, dateX, dateY, fontSize])

    // Load background image and set canvas size
    useEffect(() => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            backgroundImageRef.current = img
            setImageLoaded(true)

            // Set canvas size to match the aspect ratio of a single card (quarter of the full sheet)
            if (canvasRef.current) {
                // Single card dimensions (top-left quadrant)
                const cardWidth = img.width / 2
                const cardHeight = img.height / 2

                // We'll scale it down to fit in the UI but keep aspect ratio
                // Max width 800px
                const scale = Math.min(800 / cardWidth, 1)
                canvasRef.current.width = cardWidth * scale
                canvasRef.current.height = cardHeight * scale
            }
            redrawCanvas()
        }
        img.src = getTemplateUrl()
    }, [getTemplateUrl, redrawCanvas])

    // Re-draw when actions change
    useEffect(() => {
        redrawCanvas()
    }, [actions, imageLoaded, redrawCanvas])

    const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        }
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getPos(e)

        if (tool === 'pen') {
            setIsDrawing(true)
            setCurrentStroke([pos])
        } else if (tool === 'circle') {
            setActions(prev => [...prev, { type: 'circle', data: pos }])
        } else if (tool === 'text') {
            setTextPosition(pos)
        }
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || tool !== 'pen') return
        const pos = getPos(e)
        setCurrentStroke(prev => [...prev, pos])

        // Draw current stroke in real-time
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx || currentStroke.length === 0) return

        ctx.beginPath()
        ctx.strokeStyle = '#2563eb'
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.moveTo(currentStroke[currentStroke.length - 1].x, currentStroke[currentStroke.length - 1].y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
    }

    const handleMouseUp = () => {
        if (isDrawing && currentStroke.length > 0) {
            setActions(prev => [...prev, { type: 'stroke', data: currentStroke }])
            setCurrentStroke([])
        }
        setIsDrawing(false)
    }

    const handleTextSubmit = () => {
        if (textInput && textPosition) {
            setActions(prev => [...prev, {
                type: 'text',
                data: { text: textInput, x: textPosition.x, y: textPosition.y }
            }])
            setTextInput('')
            setTextPosition(null)
        }
    }

    const handleUndo = () => {
        setActions(prev => prev.slice(0, -1))
    }

    const handleClear = () => {
        setActions([])
    }

    const handleSave = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const dataUrl = canvas.toDataURL('image/png')
        onSave(dataUrl)
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-md">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setTool('pen')}
                        className={`p-2 rounded-lg transition-all ${tool === 'pen' ? 'bg-[var(--brand)] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        title="Draw"
                    >
                        <LucidePencil className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setTool('circle')}
                        className={`p-2 rounded-lg transition-all ${tool === 'circle' ? 'bg-[var(--brand)] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        title="Circle marker"
                    >
                        <LucideCircle className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setTool('text')}
                        className={`p-2 rounded-lg transition-all ${tool === 'text' ? 'bg-[var(--brand)] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        title="Add text"
                    >
                        <LucideType className="h-5 w-5" />
                    </button>
                    <div className="w-px bg-gray-300 mx-2" />
                    <button
                        type="button"
                        onClick={handleUndo}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                        title="Undo"
                    >
                        <LucideUndo className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-all"
                        title="Clear all"
                    >
                        <LucideTrash2 className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
                    >
                        <LucideSave className="h-5 w-5" />
                        Save Card
                    </button>
                </div>
            </div>

            {/* Text input popup */}
            {textPosition && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-2xl space-y-4 max-w-md w-full mx-4">
                        <h3 className="font-bold text-lg">Add Text</h3>
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[var(--brand)]"
                            rows={3}
                            placeholder="Type your text here..."
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => { setTextPosition(null); setTextInput(''); }}
                                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleTextSubmit}
                                className="px-4 py-2 bg-[var(--brand)] text-white rounded-lg font-bold"
                            >
                                Add Text
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sensei Name Input */}
            <div className="bg-white rounded-xl p-3 shadow-md">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sensei Name (type your name here)
                </label>
                <input
                    type="text"
                    value={senseiNameInput}
                    onChange={(e) => setSenseiNameInput(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                />
            </div>

            {/* Canvas */}
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="w-full cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <p className="text-gray-500">Loading template...</p>
                    </div>
                )}
            </div>

            <p className="text-xs text-center text-gray-500">
                Use the tools above to mark completed levels and add notes. Click Save when done.
            </p>
        </div>
    )
}
