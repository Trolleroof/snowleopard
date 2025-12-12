import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SnowLeopardPlaygroundClient } from '@snowleopard-ai/client';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  let client: SnowLeopardPlaygroundClient | null = null;

  try {
    const body = await request.json();
    const transcript = body.transcript as string;
    const latitude = body.latitude as string;
    const longitude = body.longitude as string;

    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Initialize Gemini model (using gemini-2.5-flash for Gemini 2.5)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Analyze the transcript with Gemini to match inventory items
    const prompt = `You are an inventory classification system. Analyze the transcript and identify which item(s) from our inventory list are being requested.

INVENTORY LIST:
-Canned Black Beans
-Chicken Noodle Soup
-Boxes of Diapers
-Children's Multivitamins
-Winter Coats
-Shelf-Stable Milk
-Boxes of Cereal
-Toothbrush Kits
-Lays Chips
-Reusable Water Bottles
-Canned Tuna
-Bags of Rice
-First-Aid Kits
-Hand Sanitizer
-Blankets/Throws
-Peanut Butter Jars
-Pasta & Sauce Kits
-Feminine Hygiene Pads
-Reading Glasses
-Backpacks

TRANSCRIPT: "${transcript}"

INSTRUCTIONS:
1. First, ignore all repetitions, disfluencies (like "hey", "um", "uh"), and partial words in the transcript
2. Extract the core question/intent from the transcript (e.g., "how many boxes of cereal" → "cereal" or "Boxes of Cereal")
3. Match the extracted item to the EXACT entry in the inventory list above (case-sensitive, exact spelling)
4. If multiple items match, list all of them separated by commas
5. If no items match, respond with "No matching items found"
6. Return ONLY the exact item name(s) from the list, nothing else - no explanations, no extra text

RESPONSE FORMAT:
- For single item: "Boxes of Cereal"
- For multiple items: "Canned Black Beans, Chicken Noodle Soup"
- For no match: "No matching items found"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const matchedItem = response.text().trim();

    // Get location name from coordinates if available
    let locationName = null;
    if (latitude && longitude) {
      try {
        const locationPrompt = `You are a location matching system. Given GPS coordinates, select the CLOSEST address from this list of donation center locations:

DONATION CENTER LOCATIONS:
- 880 Mabury Rd, San Jose, CA 95133
- 1781 Union St, San Francisco, CA 94123
- 2508 Historic Decatur Rd, San Diego, CA 92106
- 320 E 43rd St, New York, NY 10017

USER COORDINATES: ${latitude}, ${longitude}

INSTRUCTIONS:
1. Determine which city/area these coordinates are closest to
2. Return ONLY the exact address from the list above that is nearest to these coordinates
3. Return the FULL address exactly as shown in the list
4. No explanations, no extra text, just the address

RESPONSE FORMAT: Just the address, nothing else.
Example: "880 Mabury Rd, San Jose, CA 95133"`;

        const locationResult = await model.generateContent(locationPrompt);
        const locationResponse = await locationResult.response;
        locationName = locationResponse.text().trim();

        console.log('Matched coordinates to nearest donation center:', locationName);
      } catch (err) {
        console.error('Error matching location:', err);
        locationName = null;
      }
    }

    // If no matching item found, return early
    if (!matchedItem || matchedItem === 'No matching items found') {
      return NextResponse.json({
        success: false,
        analysis: matchedItem,
        location: latitude && longitude ? {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          name: locationName
        } : null,
        error: 'No matching items found',
        answer: 'No matching items found',
        timestamp: new Date().toISOString(),
      });
    }

    // Now query SnowLeopard with the matched item
    if (!process.env.SNOWLEOPARD_API_KEY) {
      return NextResponse.json(
        { error: 'SnowLeopard API key not configured' },
        { status: 500 }
      );
    }

    if (!process.env.SNOWLEOPARD_DATAFILE_ID) {
      return NextResponse.json(
        { error: 'SnowLeopard datafile ID not configured' },
        { status: 500 }
      );
    }

    // Initialize SnowLeopard client
    client = new SnowLeopardPlaygroundClient({
      apiKey: process.env.SNOWLEOPARD_API_KEY,
    });

    console.log('Using datafile ID:', process.env.SNOWLEOPARD_DATAFILE_ID);

    // Query for stock availability using the response method
    let question = '';

    if (locationName) {
      // Use the matched donation center address
      question = `Check the table for the stock of ${matchedItem} at ${locationName}. How many are available?`;
      console.log('Query with matched location:', question);
    } else {
      question = `Check the stock of ${matchedItem}. How many are in stock?`;
    }

    console.log('Sending query to SnowLeopard:', question);

    let responseStream;
    try {
      responseStream = await client.response(
        process.env.SNOWLEOPARD_DATAFILE_ID,
        question
      );
      console.log('SnowLeopard response stream received');
    } catch (fetchError: any) {
      if (fetchError.cause && fetchError.cause.code === 'EAI_AGAIN') {
        throw new Error('Network error: Unable to reach SnowLeopard API. Please check your internet connection and try again.');
      }
      throw fetchError;
    }

    // Consume the async generator stream
    let formattedStockInfo = '';
    let finalChunk: any = null;

    for await (const chunk of responseStream) {
      console.log('Chunk received:', chunk);

      // Store the final result chunk
      if (chunk.__type__ === 'responseResult') {
        finalChunk = chunk;
      }
    }

    console.log('Final chunk:', finalChunk);

    // Extract the complete answer from the LLM response
    if (finalChunk && finalChunk.llmResponse && finalChunk.llmResponse.complete_answer) {
      formattedStockInfo = finalChunk.llmResponse.complete_answer;
    } else if (finalChunk && finalChunk.llmResponse && finalChunk.llmResponse.data && finalChunk.llmResponse.data.summary) {
      formattedStockInfo = finalChunk.llmResponse.data.summary;
    } else {
      formattedStockInfo = 'No stock information available';
    }

    console.log('Final formatted info:', formattedStockInfo);

    return NextResponse.json({
      success: true,
      analysis: matchedItem,
      location: latitude && longitude ? {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        name: locationName
      } : null,
      item: matchedItem,
      question: question,
      stockInfo: formattedStockInfo.trim(),
      // Voice UI expects `answer`; use the same formatted response.
      answer: formattedStockInfo.trim(),
      rawData: finalChunk,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error processing transcript:', error);
    return NextResponse.json(
      {
        error: 'Failed to process transcript',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    // Always close the client connection
    if (client) {
      await client.close();
    }
  }
}
