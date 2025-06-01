const fs = require('fs');
const path = require('path');

// Read the current sampleEvents file
const sampleEventsPath = path.join(__dirname, '../src/constants/sampleEvents.ts');
let fileContent = fs.readFileSync(sampleEventsPath, 'utf8');

// Function to generate fake URLs based on event category/type
function generateFakeUrl(event) {
  const { category, tags, title } = event;
  
  // Create a URL-friendly slug from the title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .slice(0, 50); // Limit length
  
  // Generate URL based on category or primary tag
  const baseUrls = {
    'concert': 'https://ticketmaster.com/events',
    'music': 'https://songkick.com/concerts',
    'classical music concert': 'https://lincolncenter.org/event',
    'hip hop concert': 'https://livenation.com/event',
    'edm rave': 'https://edmtrain.com/event',
    'rooftop party': 'https://partytickets.com/event',
    'silent disco party': 'https://silentevents.com/event',
    'gallery opening': 'https://artnet.com/galleries/opening',
    'art show': 'https://timeout.com/newyork/art/exhibition',
    'broadway show': 'https://broadway.com/shows',
    'off-broadway show': 'https://theatermania.com/off-broadway',
    'drag show': 'https://dragqueenyc.com/shows',
    'fashion show': 'https://nyfw.com/shows',
    'food festival': 'https://eater.com/events',
    'restaurant opening': 'https://resy.com/cities/ny/venues',
    'tech meetup': 'https://meetup.com/events',
    'tech conference': 'https://eventbrite.com/e',
    'happy hour': 'https://happyhour.nyc/events',
    'founder dinner': 'https://founderdinner.com/events',
    'hot yoga': 'https://classpass.com/studios',
    'running club': 'https://nyrr.org/events',
    'dance class': 'https://steezy.co/classes',
    'gala': 'https://blacktie.nyc/galas',
    'film screening': 'https://filmlinc.org/screenings',
    'holiday market': 'https://timeout.com/newyork/shopping/holiday-markets',
    'trivia night': 'https://trivianight.nyc/events',
    'game night': 'https://gamenight.nyc/events',
    'open mic night': 'https://openmic.nyc/events',
    'party': 'https://partytickets.com/nyc',
    'art': 'https://timeout.com/newyork/art'
  };
  
  // Find the best matching base URL
  let baseUrl = baseUrls[category] || baseUrls['party']; // Default fallback
  
  // If no category match, try tags
  if (baseUrl === baseUrls['party'] && tags && tags.length > 0) {
    for (const tag of tags) {
      if (baseUrls[tag]) {
        baseUrl = baseUrls[tag];
        break;
      }
    }
  }
  
  // Generate random ID for the URL
  const randomId = Math.floor(Math.random() * 1000000);
  
  return `${baseUrl}/${slug}-${randomId}`;
}

// Parse the file content to extract events
const eventsStart = fileContent.indexOf('export const sampleEvents: EventNode[] = [');
const eventsEnd = fileContent.lastIndexOf('];');

if (eventsStart === -1 || eventsEnd === -1) {
  console.error('Could not find sampleEvents array in file');
  process.exit(1);
}

// Extract the events array content
const beforeEvents = fileContent.substring(0, eventsStart + 'export const sampleEvents: EventNode[] = ['.length);
const afterEvents = fileContent.substring(eventsEnd);
const eventsContent = fileContent.substring(eventsStart + 'export const sampleEvents: EventNode[] = ['.length, eventsEnd);

// Parse events (simple approach - split by event objects)
const eventStrings = [];
let currentEvent = '';
let braceCount = 0;
let inEvent = false;

for (let i = 0; i < eventsContent.length; i++) {
  const char = eventsContent[i];
  
  if (char === '{') {
    if (!inEvent) {
      inEvent = true;
      currentEvent = '';
    }
    braceCount++;
  }
  
  if (inEvent) {
    currentEvent += char;
  }
  
  if (char === '}') {
    braceCount--;
    if (braceCount === 0 && inEvent) {
      eventStrings.push(currentEvent.trim());
      currentEvent = '';
      inEvent = false;
    }
  }
}

console.log(`Found ${eventStrings.length} events to process...`);

// Process each event to add URL if missing
const updatedEventStrings = eventStrings.map((eventStr, index) => {
  // Check if URL already exists
  if (eventStr.includes('url:')) {
    console.log(`Event ${index + 1} already has URL, skipping...`);
    return eventStr;
  }
  
  try {
    // Extract basic info to generate URL
    const titleMatch = eventStr.match(/title:\s*"([^"]+)"/);
    const categoryMatch = eventStr.match(/category:\s*"([^"]+)"/);
    const tagsMatch = eventStr.match(/tags:\s*\[([^\]]+)\]/);
    
    if (!titleMatch) {
      console.log(`Event ${index + 1}: Could not extract title, skipping...`);
      return eventStr;
    }
    
    const title = titleMatch[1];
    const category = categoryMatch ? categoryMatch[1] : null;
    const tagsStr = tagsMatch ? tagsMatch[1] : '';
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim().replace(/"/g, '')) : [];
    
    // Generate fake URL
    const fakeUrl = generateFakeUrl({ title, category, tags });
    
    // Insert URL after date field
    const dateMatch = eventStr.match(/date:\s*"[^"]+",/);
    if (dateMatch) {
      const insertPoint = eventStr.indexOf(dateMatch[0]) + dateMatch[0].length;
      const updatedEvent = eventStr.slice(0, insertPoint) + 
                          `\n    url: "${fakeUrl}",` + 
                          eventStr.slice(insertPoint);
      
      console.log(`Event ${index + 1}: Added URL for "${title}"`);
      return updatedEvent;
    } else {
      console.log(`Event ${index + 1}: Could not find date field for "${title}", skipping...`);
      return eventStr;
    }
  } catch (error) {
    console.error(`Event ${index + 1}: Error processing event - ${error.message}`);
    return eventStr;
  }
});

// Reconstruct the file
const updatedEventsContent = updatedEventStrings.join(',\n  ');
const updatedFileContent = beforeEvents + '\n  ' + updatedEventsContent + '\n' + afterEvents;

// Write the updated file
fs.writeFileSync(sampleEventsPath, updatedFileContent, 'utf8');

console.log('\n✅ Successfully updated sampleEvents.ts with fake URLs!');
console.log(`📁 Updated file: ${sampleEventsPath}`);
console.log(`🔗 Generated URLs for ${updatedEventStrings.filter((_, i) => !eventStrings[i].includes('url:')).length} events`); 