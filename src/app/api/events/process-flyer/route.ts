import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { classifyImage } from '@/server/LamService';
import { addFlyerEvent } from '@/actions/eventActions';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');

async function ensureUploadsDir() {
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }
}

/**
 * API route to process uploaded flyer images using AI
 * Extracts event information from the flyer image and adds it to the system
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure uploads directory exists
    await ensureUploadsDir();

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('flyer') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const filename = `flyer_${timestamp}${fileExtension}`;
    const filepath = path.join(uploadsDir, filename);

    try {
      // Convert File to Buffer and save temporarily
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      console.log(`File saved temporarily: ${filepath}`);

      // Process the image using the existing LamService
      const extractedData = await classifyImage(filepath);

      console.log('Extracted data from flyer:', extractedData);

      // Enhanced prompt to get more detailed information
      const enhancedData = await enhanceEventData(extractedData, filepath);

      // Clean up the temporary file
      await unlink(filepath).catch(console.error);

      // Add the event to the system using the addFlyerEvent action
      const eventResult = await addFlyerEvent({
        title: enhancedData.title || extractedData.title || 'Untitled Event',
        description: enhancedData.description || extractedData.description || 'Event extracted from flyer',
        date: enhancedData.date || extractedData.date,
        tags: enhancedData.tags || extractedData.tags || [],
        category: enhancedData.category || extractedData.category || 'event',
        keywords: enhancedData.keywords || extractedData.keywords || enhancedData.tags || extractedData.tags || [],
        location: enhancedData.location || extractedData.location,
        time: enhancedData.time || extractedData.time,
        price: enhancedData.price || extractedData.price,
        artists: enhancedData.artists || extractedData.artists,
        genre: enhancedData.genre || extractedData.genre,
      });

      if (!eventResult.success) {
        console.error('Failed to add event to system:', eventResult.error);
        return NextResponse.json(
          { error: eventResult.error || 'Failed to add event to system' },
          { status: 500 }
        );
      }

      // Return the extracted event data with success confirmation
      return NextResponse.json({
        success: true,
        message: 'Event successfully extracted and added to Party Graph!',
        event: eventResult.event,
        title: eventResult.event?.title,
        description: eventResult.event?.description,
        date: eventResult.event?.date,
        tags: eventResult.event?.tags || [],
        category: eventResult.event?.category,
        keywords: eventResult.event?.keywords || [],
        location: enhancedData.location || extractedData.location,
        time: enhancedData.time || extractedData.time,
        price: enhancedData.price || extractedData.price,
      });

    } catch (processingError) {
      // Clean up file if it exists
      await unlink(filepath).catch(() => {});
      
      console.error('Error processing flyer:', processingError);
      return NextResponse.json(
        { error: 'Failed to process flyer image. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Enhanced AI processing to extract more detailed event information
 */
async function enhanceEventData(initialData: any, imagePath: string) {
  try {
    // If we already have good data, return it
    if (initialData.title && initialData.description && initialData.tags) {
      return initialData;
    }

    // Use a more detailed prompt for better extraction
    const { LlamaAPIClient } = await import('llama-api-client');
    const fs = await import('fs/promises');
    
    const client = new LlamaAPIClient({
      apiKey: process.env["LLAMA_API_KEY"],
    });

    const imageBuffer = await fs.readFile(imagePath);
    const imageBase64 = imageBuffer.toString('base64');

    const enhancedPrompt = `
You are an expert event flyer analyzer. Carefully examine this event flyer image and extract ALL the event details you can find. Use OCR to read all text in the image, then analyze and structure the information.

Please return a JSON object with the following fields (fill in as much as you can find):
{
  "title": "Main event title/name",
  "description": "Brief description of the event",
  "date": "Event date in YYYY-MM-DD format if found",
  "time": "Event time if found",
  "location": "Venue name and/or address",
  "tags": ["relevant", "tags", "based", "on", "event", "type"],
  "category": "primary category (concert, party, festival, etc.)",
  "keywords": ["searchable", "keywords", "from", "the", "flyer"],
  "price": "Ticket price information if available",
  "artists": ["performer", "names", "if", "music", "event"],
  "genre": "Music genre or event style if applicable"
}

Look for:
- Event names, titles, headlines
- Date and time information
- Venue names and locations
- Artist/performer names
- Genre or event type indicators
- Ticket prices
- Any other relevant event details

Return ONLY valid JSON, no other text.`;

    const response = await client.chat.completions.create({
      model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: enhancedPrompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.3,
    });

    const content = response.completion_message?.content;
    let text = typeof content === "string" ? content : content?.text;
    
    if (!text) {
      console.log('No enhanced data extracted, returning initial data');
      return initialData;
    }

    // Try to extract JSON from the response
    const match = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```([\s\S]*?)```/i);
    const jsonString = match ? match[1] : text;

    try {
      const enhancedData = JSON.parse(jsonString);
      console.log('Enhanced data extracted:', enhancedData);
      
      // Merge with initial data, preferring enhanced data
      return {
        ...initialData,
        ...enhancedData,
        // Ensure tags is always an array
        tags: enhancedData.tags || initialData.tags || [],
        keywords: enhancedData.keywords || enhancedData.tags || initialData.tags || [],
      };
    } catch (parseError) {
      console.error('Failed to parse enhanced data JSON:', parseError);
      return initialData;
    }

  } catch (error) {
    console.error('Error in enhanced processing:', error);
    return initialData;
  }
} 