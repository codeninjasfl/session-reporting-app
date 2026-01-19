
import { decompress } from 'lzma1';

// Constants from PXT
const imageMagic = 0x59347a7d;
const imageHeaderSize = 36;

export interface ExtractedProject {
    header: any;
    text: Record<string, string>;
}

// Raw format from PNG can be either:
// 1. { meta: {...}, source: "JSON string of files" }
// 2. { header: {...}, text: {...} }
interface RawPngProject {
    meta?: any;
    source?: string;
    header?: any;
    text?: Record<string, string>;
}

/**
 * Normalizes the raw decoded project to a standard format
 */
function normalizeProject(raw: RawPngProject): ExtractedProject {
    // If it already has header and text, return as-is
    if (raw.header && raw.text) {
        return { header: raw.header, text: raw.text };
    }

    // If it has meta and source (IMPACT format), parse the source
    if (raw.source) {
        let text: Record<string, string>;
        try {
            text = JSON.parse(raw.source);
        } catch (e) {
            console.error('Failed to parse source JSON:', e);
            throw new Error('Failed to parse project source');
        }

        // Extract header info from pxt.json if available
        let header: any = raw.meta || {};
        if (text['pxt.json']) {
            try {
                const pxtJson = JSON.parse(text['pxt.json']);
                header = {
                    ...header,
                    name: pxtJson.name || 'IMPACT Project',
                    target: 'arcade',
                    targetVersion: pxtJson.targetVersions?.target || '1.12.30',
                    editor: pxtJson.preferredEditor || 'blocksprj',
                };
            } catch (e) {
                console.warn('Could not parse pxt.json:', e);
            }
        }

        return { header, text };
    }

    throw new Error('Unknown project format');
}

export async function decodeMakeCodePng(imageUrl: string): Promise<ExtractedProject> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";

        // Add timeout to prevent hanging
        const timeoutId = setTimeout(() => {
            reject(new Error("Timeout loading image for decoding"));
        }, 10000);

        img.onload = async () => {
            clearTimeout(timeoutId);
            try {
                console.log('pxt-utils: Image loaded successfully, dimensions:', img.width, 'x', img.height);
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error("Could not get canvas context");

                ctx.drawImage(img, 0, 0);
                const imgdat = ctx.getImageData(0, 0, canvas.width, canvas.height);
                console.log('pxt-utils: Got image data');
                const d = imgdat.data;
                const bpp = (d[0] & 1) | ((d[1] & 1) << 1) | ((d[2] & 1) << 2);

                if (bpp > 5 || bpp === 0) {
                    throw new Error("Invalid encoded PNG format: bpp=" + bpp);
                }

                function decode(ptr: number, bpp: number, trg: Uint8Array) {
                    let shift = 0;
                    let i = 0;
                    let acc = 0;
                    const mask = (1 << bpp) - 1;
                    while (i < trg.length) {
                        if (ptr >= d.length) break;
                        acc |= (d[ptr++] & mask) << shift;
                        if ((ptr & 3) === 3)
                            ptr++; // skip alpha
                        shift += bpp;
                        if (shift >= 8) {
                            trg[i++] = acc & 0xff;
                            acc >>= 8;
                            shift -= 8;
                        }
                    }
                    return ptr;
                }

                // Decode Header
                const hd = new Uint8Array(imageHeaderSize);
                let ptr = decode(4, bpp, hd);

                // Decode U32LE (Header check)
                const magic = hd[0] | (hd[1] << 8) | (hd[2] << 16) | (hd[3] << 24);
                if (magic !== imageMagic) {
                    throw new Error("Invalid magic in encoded PNG: " + magic.toString(16));
                }

                const dataLen = hd[4] | (hd[5] << 8) | (hd[6] << 16) | (hd[7] << 24);
                const addedLines = hd[8] | (hd[9] << 8) | (hd[10] << 16) | (hd[11] << 24);

                let res: Uint8Array;

                if (addedLines > 0) {
                    const origSize = (canvas.height - addedLines) * canvas.width;
                    const imgCap = (origSize - 1) * 3 * bpp >> 3;
                    const tmp = new Uint8Array(imgCap - imageHeaderSize);
                    ptr = decode(ptr, bpp, tmp);

                    res = new Uint8Array(dataLen);
                    res.set(tmp);

                    const added = new Uint8Array(dataLen - tmp.length);
                    decode(origSize * 4, 8, added);
                    res.set(added, tmp.length);
                } else {
                    res = new Uint8Array(dataLen);
                    decode(ptr, bpp, res);
                }

                let jsonStr = "";

                // Check for LZMA (0x5D is ']', typical LZMA property byte)
                if (res[0] === 0x5D) {
                    console.log('pxt-utils: Detected LZMA compression. Decompressing...');
                    try {
                        const decompressed = decompress(res);
                        jsonStr = new TextDecoder().decode(decompressed);
                    } catch (lzmaErr) {
                        console.error('LZMA Decompression Error:', lzmaErr);
                        throw new Error('Failed to decompress LZMA blob');
                    }
                } else {
                    jsonStr = new TextDecoder().decode(res);
                }

                console.log('pxt-utils: Decoded String Length:', jsonStr.length);

                let rawProject: RawPngProject;
                try {
                    rawProject = JSON.parse(jsonStr);
                } catch (e) {
                    console.error('JSON Parse Error in pxt-utils. Raw output start:', jsonStr.substring(0, 100));
                    throw new Error('Failed to parse decoded JSON');
                }

                // Normalize to standard format
                const project = normalizeProject(rawProject);

                resolve(project);

            } catch (e) {
                console.error('pxt-utils: decoding error', e);
                reject(e);
            }
        };
        img.onerror = (e) => {
            clearTimeout(timeoutId);
            console.error('pxt-utils: Image load failed', e);
            reject(new Error("Failed to load image for decoding"));
        };

        img.src = imageUrl;
    });
}
