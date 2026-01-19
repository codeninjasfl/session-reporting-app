import { NextRequest, NextResponse } from 'next/server';

// MakeCode Arcade Cloud API endpoint
const MAKECODE_API_BASE = 'https://arcade.makecode.com/api';

interface MakeCodeProject {
    header: {
        name: string;
        meta: Record<string, unknown>;
        editor: string;
        pubId?: string;
        pubCurrent?: boolean;
        target: string;
        targetVersion: string;
        cloudUserId?: string;
        id: string;
        recentUse: number;
        modificationTime: number;
        path: string;
        saveId?: unknown;
        blobId?: string;
        blobVersion?: string;
        blobCurrent?: boolean;
    };
    text: Record<string, string>;
}

interface PublishResponse {
    success: boolean;
    shareId?: string;
    embedUrl?: string;
    simulatorUrl?: string;
    error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<PublishResponse>> {
    try {
        const body = await request.json();
        const { project, title } = body as { project: MakeCodeProject; title: string };

        if (!project || !project.text) {
            return NextResponse.json(
                { success: false, error: 'Invalid project data' },
                { status: 400 }
            );
        }

        // Prepare the project for publishing
        const now = Date.now();
        const projectHeader = {
            ...project.header,
            name: title || project.header?.name || 'IMPACT Project',
            target: 'arcade',
            targetVersion: '1.12.30',
            editor: 'blocksprj',
            pubId: '',
            pubCurrent: false,
            meta: {},
            id: crypto.randomUUID(),
            recentUse: now,
            modificationTime: now,
            path: 'project',
        };

        const projectText = project.text;

        // MakeCode uses a specific format for publishing
        // We need to POST to their scripts endpoint
        const publishPayload = {
            name: projectHeader.name,
            target: 'arcade',
            targetVersion: projectHeader.targetVersion,
            description: '',
            editor: projectHeader.editor,
            text: projectText,
            meta: {},
        };

        // Try to publish using MakeCode's script API
        const response = await fetch(`${MAKECODE_API_BASE}/scripts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(publishPayload),
        });

        if (!response.ok) {
            // MakeCode's API might not be publicly available for anonymous publishing
            // Fall back to creating a data URL approach
            const errorText = await response.text();
            console.error('MakeCode publish failed:', errorText);

            return NextResponse.json({
                success: false,
                error: 'MakeCode publishing API not available for anonymous projects'
            }, { status: 503 });
        }

        const result = await response.json();
        const shareId = result.id || result.shortid;

        if (!shareId) {
            return NextResponse.json({
                success: false,
                error: 'No share ID returned from MakeCode'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            shareId,
            embedUrl: `https://arcade.makecode.com/${shareId}`,
            simulatorUrl: `https://arcade.makecode.com/---run?id=${shareId}`,
        });

    } catch (error) {
        console.error('Publish error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
