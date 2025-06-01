# Flyer Upload Feature

## Overview

The Flyer Upload feature allows users to upload images of event flyers and automatically extract event information using AI. The extracted events are then added to the Party Graph system and become searchable by other users.

## How It Works

### 1. Image Processing Pipeline
- User uploads an image file (JPEG, PNG, or WebP, max 10MB)
- File is temporarily saved to the server
- AI processes the image using LLaMA vision capabilities
- Event information is extracted using advanced OCR and semantic analysis
- Event is automatically added to the system
- Temporary file is cleaned up

### 2. AI Extraction
The AI extracts the following information from flyers:
- **Title**: Main event name/title
- **Description**: Brief event description
- **Date**: Event date (formatted as YYYY-MM-DD)
- **Time**: Event time if available
- **Location**: Venue name and/or address
- **Tags**: Relevant tags based on event type
- **Category**: Primary category (concert, party, festival, etc.)
- **Keywords**: Searchable keywords from the flyer
- **Price**: Ticket price information
- **Artists**: Performer names (for music events)
- **Genre**: Music genre or event style

### 3. Event Integration
- Events are automatically tagged as "user-generated"
- Unique IDs are generated for each uploaded event
- Events become immediately searchable through the vibe search
- Events appear in the event graph and network visualization

## User Interface

### Access
The upload feature is available on the `/vibe` page through the "Upload Event Flyer" button below the search interface.

### Upload Process
1. Click "Upload Event Flyer" button
2. Drag and drop an image or click to browse files
3. Preview the selected image
4. Click "Extract Event Info" to process with AI
5. Review the extracted information
6. Event is automatically added to the system

### Visual Feedback
- **Drag & Drop**: Visual indicators during file drag operations
- **File Validation**: Immediate feedback for invalid files
- **Processing**: Loading animation with AI branding during extraction
- **Success**: Green success banner with extracted event details
- **Errors**: Clear error messages with troubleshooting suggestions

## Technical Implementation

### Frontend Components
- **FlyerUpload.tsx**: Main upload component with drag-and-drop functionality
- **Integration**: Seamlessly integrated into the vibe search page
- **State Management**: Handles upload states, processing, and success/error states

### Backend API
- **Route**: `/api/events/process-flyer`
- **Method**: POST with multipart form data
- **Processing**: Uses existing LamService for AI image analysis
- **Storage**: Temporary file storage with automatic cleanup

### Server Actions
- **addFlyerEvent**: Specialized action for handling flyer-extracted events
- **Event Enhancement**: Adds location, time, price info to event descriptions
- **Tag Management**: Automatically generates relevant tags and keywords

## Security & Validation

### File Validation
- **File Types**: Only JPEG, PNG, WebP images allowed
- **File Size**: Maximum 10MB per upload
- **Sanitization**: Proper file handling and cleanup

### Error Handling
- **Graceful Degradation**: Fallback to basic extraction if enhanced processing fails
- **File Cleanup**: Automatic removal of temporary files
- **User Feedback**: Clear error messages for troubleshooting

## Usage Examples

### Supported Flyer Types
- **Concert Flyers**: Music events, artist names, venue information
- **Party Invitations**: Social events, date/time details
- **Festival Posters**: Multi-day events, lineup information
- **Gallery Openings**: Art events, exhibition details
- **Food Events**: Restaurant openings, food festivals

### Best Practices
1. **Clear Images**: Use high-resolution, well-lit photos
2. **Readable Text**: Ensure text is not distorted or blurry
3. **Complete Information**: Include flyers with date, time, and location
4. **Standard Formats**: Common flyer layouts work best

## Future Enhancements

### Planned Features
- **Bulk Upload**: Support for multiple flyer uploads
- **Manual Editing**: Allow users to edit extracted information
- **Image Enhancement**: Automatic image processing for better OCR
- **Format Detection**: Support for PDF flyers
- **Event Verification**: Community-based verification system

### Integration Opportunities
- **Social Media**: Direct upload from social media images
- **Email Integration**: Extract events from email attachments
- **Calendar Export**: Generate calendar files from extracted events
- **Location Services**: Enhanced venue detection and mapping

## Troubleshooting

### Common Issues
1. **Upload Fails**: Check file format and size limits
2. **Poor Extraction**: Try with a clearer, higher-resolution image
3. **Missing Information**: Manually search for events or use text search
4. **Processing Timeout**: Retry with a smaller image file

### Error Messages
- **"Invalid file type"**: Upload only JPEG, PNG, or WebP images
- **"File size too large"**: Reduce file size to under 10MB
- **"Failed to process flyer"**: Try again with a clearer image
- **"No text found"**: Ensure the flyer contains readable text

## API Reference

### POST /api/events/process-flyer

**Request:**
```
Content-Type: multipart/form-data
Body: flyer (File)
```

**Response:**
```json
{
  "success": true,
  "message": "Event successfully extracted and added to Party Graph!",
  "event": {
    "id": "flyer-event-name-timestamp",
    "title": "Event Name",
    "description": "Event description with location and time details",
    "date": "2025-07-15",
    "category": "concert",
    "tags": ["music", "live", "user-generated"],
    "keywords": ["artist", "venue", "concert"]
  },
  "location": "Venue Name",
  "time": "8:00 PM",
  "price": "$25"
}
```

**Error Response:**
```json
{
  "error": "Error message description"
}
``` 