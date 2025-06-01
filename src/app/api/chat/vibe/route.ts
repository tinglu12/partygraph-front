import { NextRequest, NextResponse } from 'next/server';
import LlamaAPIClient from 'llama-api-client';
import { sampleEvents } from '@/constants/sampleEvents-v2';
import { EventNode } from '@/types/EventGraph';

const client = new LlamaAPIClient({
  apiKey: process.env.LLAMA_API_KEY,
});

const model = "Llama-4-Maverick-17B-128E-Instruct-FP8";

export async function POST(request: NextRequest) {
  try {
    const { message, selectedEvent } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Create context about available events
    const eventsContext = sampleEvents.map(event => {
      // Only include available information, skip undefined/null values
      const eventInfo: any = {
        title: event.title,
        description: event.description,
        category: event.category,
      };
      
      if (event.date && event.date !== 'TBD') eventInfo.date = event.date;
      if (event.venue) eventInfo.venue = event.venue;
      if (event.neighborhood) eventInfo.neighborhood = event.neighborhood;
      if (event.tags && event.tags.length > 0) eventInfo.tags = event.tags;
      if (event.url) eventInfo.url = event.url;
      if (event.keywords && event.keywords.length > 0) eventInfo.keywords = event.keywords;
      
      return eventInfo;
    }).slice(0, 20); // Limit to first 20 events to avoid token limits

    let systemPrompt = `You are a helpful AI assistant for a party and events app. You help users discover and learn about events in NYC. 

Available events data (this is just a sample, there may be more events):
${JSON.stringify(eventsContext, null, 2)}

Guidelines:
- Keep responses conversational and concise (2-3 sentences max)
- When you don't have specific information, say "I don't know" in natural language
- Help users find events that match their interests
- If asked about events not in the data, mention that you can only help with the events you know about
- Be friendly and enthusiastic about events`;

    if (selectedEvent) {
      systemPrompt += `\n\nCurrent context: The user is asking about "${selectedEvent.title}" specifically. Here are the details I have:
${JSON.stringify(selectedEvent, null, 2)}`;
    }

    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
    });

    const content = response.completion_message?.content;
    let responseText = typeof content === 'string' ? content : content?.text;

    if (!responseText) {
      responseText = "Sorry, I'm having trouble right now. Can you try asking again?";
    }

    return NextResponse.json({ response: responseText });

  } catch (error) {
    console.error('Vibe chat API error:', error);
    return NextResponse.json(
      { error: 'Sorry, I had trouble processing your message. Please try again!' },
      { status: 500 }
    );
  }
} 