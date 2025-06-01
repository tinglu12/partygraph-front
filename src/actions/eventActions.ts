"use server";

import { EventNode } from "@/types/EventGraph";
import { sampleEvents } from "@/constants/sampleEvents";
import { writeFile } from "fs/promises";
import path from "path";

/**
 * Add a new event to the system
 * For now, this adds to the in-memory sampleEvents array
 * In a real app, this would save to a database
 */
export async function addEvent(event: EventNode): Promise<{ success: boolean; event?: EventNode; error?: string }> {
  try {
    // Validate required fields
    if (!event.title || !event.id) {
      return {
        success: false,
        error: "Event must have a title and ID"
      };
    }

    // Check if event with this ID already exists
    const existingEvent = sampleEvents.find(e => e.id === event.id);
    if (existingEvent) {
      return {
        success: false,
        error: "Event with this ID already exists"
      };
    }

    // Create the new event with defaults
    const newEvent: EventNode = {
      id: event.id,
      title: event.title,
      description: event.description || "",
      date: event.date,
      category: event.category || "event",
      tags: event.tags || [],
      keywords: event.keywords || event.tags || [],
      connections: event.connections || [],
    };

    // Add to sampleEvents array (in real app, save to database)
    sampleEvents.push(newEvent);

    // Log the addition
    console.log(`Added new event: ${newEvent.title} (ID: ${newEvent.id})`);

    return {
      success: true,
      event: newEvent
    };

  } catch (error) {
    console.error("Error adding event:", error);
    return {
      success: false,
      error: "Failed to add event"
    };
  }
}

/**
 * Add a new event extracted from a flyer
 * Includes special handling for flyer-sourced events
 */
export async function addFlyerEvent(
  eventData: Omit<EventNode, 'id'> & { 
    location?: string; 
    time?: string; 
    price?: string;
    artists?: string[];
    genre?: string;
  }
): Promise<{ success: boolean; event?: EventNode; error?: string }> {
  try {
    // Generate a unique ID for the flyer event
    const timestamp = Date.now();
    const titleSlug = eventData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const eventId = `flyer-${titleSlug}-${timestamp}`;

    // Create enhanced description with flyer information
    let description = eventData.description || "";
    
    // Add location, time, and price to description if available
    const additionalInfo = [];
    if (eventData.location) additionalInfo.push(`Location: ${eventData.location}`);
    if (eventData.time) additionalInfo.push(`Time: ${eventData.time}`);
    if (eventData.price) additionalInfo.push(`Price: ${eventData.price}`);
    if (eventData.artists && eventData.artists.length > 0) {
      additionalInfo.push(`Artists: ${eventData.artists.join(', ')}`);
    }
    
    if (additionalInfo.length > 0) {
      description = description + (description ? '\n\n' : '') + additionalInfo.join('\n');
    }

    // Create enhanced tags
    const tags = [...(eventData.tags || [])];
    if (eventData.genre && !tags.includes(eventData.genre)) {
      tags.push(eventData.genre);
    }
    if (eventData.artists) {
      eventData.artists.forEach(artist => {
        if (!tags.includes(artist)) {
          tags.push(artist);
        }
      });
    }
    // Add "user-generated" tag to indicate this was from a flyer upload
    if (!tags.includes("user-generated")) {
      tags.push("user-generated");
    }

    // Create the event
    const newEvent: EventNode = {
      id: eventId,
      title: eventData.title,
      description,
      date: eventData.date,
      category: eventData.category || "event",
      tags,
      keywords: [...tags, ...(eventData.keywords || [])],
      connections: [],
    };

    // Add the event to the system
    const result = await addEvent(newEvent);
    
    if (result.success) {
      console.log(`Successfully added flyer event: ${newEvent.title}`);
    }

    return result;

  } catch (error) {
    console.error("Error adding flyer event:", error);
    return {
      success: false,
      error: "Failed to add flyer event"
    };
  }
}

/**
 * Get all events (for now, returns sampleEvents)
 * In a real app, this would query the database
 */
export async function getAllEvents(): Promise<EventNode[]> {
  return sampleEvents;
}

/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<EventNode | null> {
  const event = sampleEvents.find(e => e.id === id);
  return event || null;
}

/**
 * Update an existing event
 */
export async function updateEvent(id: string, updates: Partial<EventNode>): Promise<{ success: boolean; event?: EventNode; error?: string }> {
  try {
    const eventIndex = sampleEvents.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      return {
        success: false,
        error: "Event not found"
      };
    }

    // Update the event
    const updatedEvent = {
      ...sampleEvents[eventIndex],
      ...updates,
      id, // Ensure ID doesn't change
    };

    sampleEvents[eventIndex] = updatedEvent;

    console.log(`Updated event: ${updatedEvent.title} (ID: ${id})`);

    return {
      success: true,
      event: updatedEvent
    };

  } catch (error) {
    console.error("Error updating event:", error);
    return {
      success: false,
      error: "Failed to update event"
    };
  }
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const eventIndex = sampleEvents.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      return {
        success: false,
        error: "Event not found"
      };
    }

    const deletedEvent = sampleEvents.splice(eventIndex, 1)[0];
    console.log(`Deleted event: ${deletedEvent.title} (ID: ${id})`);

    return {
      success: true
    };

  } catch (error) {
    console.error("Error deleting event:", error);
    return {
      success: false,
      error: "Failed to delete event"
    };
  }
} 