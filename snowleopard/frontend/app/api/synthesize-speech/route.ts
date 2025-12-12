import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'No valid text provided for synthesis' },
        { status: 400 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Initialize ElevenLabs client
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    // Get voice ID from environment or use default
    // Popular ElevenLabs voice IDs:
    // - 'pNInz6obpgDQGcFmaJgB' (Adam - default, male, American)

    const voiceId = 'L1aJrPa7pLJEyYlh3Ilq'

    // Generate speech from text
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text.trim(),
      modelId: 'eleven_monolingual_v2',
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.2,
        useSpeakerBoost: true,
      },
    });

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = audioStream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const audioBuffer = Buffer.concat(chunks);

    // Return audio as response
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error synthesizing speech:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to synthesize speech',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
