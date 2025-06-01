"use client";

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileImage, X, Brain, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { EventNode } from '@/types/EventGraph';
import Image from 'next/image';

interface FlyerUploadProps {
  onEventExtracted?: (event: EventNode) => void;
  className?: string;
}

/**
 * Modern flyer upload component with drag-and-drop functionality
 * Processes uploaded images using AI to extract event information
 */
export const FlyerUpload = ({ onEventExtracted, className = "" }: FlyerUploadProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [extractedEvent, setExtractedEvent] = useState<EventNode | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  // Validate and process files
  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setSuccess(false);
    setUploadedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  // Process the uploaded file
  const processFlyer = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('flyer', uploadedFile);

      const response = await fetch('/api/events/process-flyer', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process flyer');
      }

      // Create the event object with extracted data
      const newEvent: EventNode = {
        id: `flyer-${Date.now()}`,
        title: result.title || 'Untitled Event',
        description: result.description || 'Event extracted from flyer',
        date: result.date || new Date().toISOString().split('T')[0],
        category: result.category || 'event',
        tags: result.tags || [],
        keywords: result.keywords || result.tags || [],
      };

      setExtractedEvent(newEvent);
      setSuccess(true);
      
      // Notify parent component
      if (onEventExtracted) {
        onEventExtracted(newEvent);
      }

    } catch (err) {
      console.error('Error processing flyer:', err);
      setError(err instanceof Error ? err.message : 'Failed to process flyer');
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear uploaded file
  const clearFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
    setExtractedEvent(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`
          relative overflow-hidden border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragActive 
            ? 'border-purple-400 bg-purple-500/10 scale-[1.02]' 
            : uploadedFile 
            ? 'border-green-400 bg-green-500/10' 
            : 'border-white/40 bg-white/5 hover:border-purple-400/60 hover:bg-white/10'
          }
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploadedFile && fileInputRef.current?.click()}
      >
        <div className="p-8 text-center">
          {!uploadedFile ? (
            // Upload prompt
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className={`
                  p-4 rounded-full transition-all duration-300
                  ${isDragActive ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300'}
                `}>
                  <Upload className="w-8 h-8" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Upload Event Flyer
                </h3>
                <p className="text-gray-300 mb-4">
                  {isDragActive 
                    ? "Drop your flyer here!" 
                    : "Drag and drop your event flyer, or click to browse"
                  }
                </p>
                <p className="text-sm text-gray-400">
                  Supports JPEG, PNG, WebP up to 10MB
                </p>
              </div>
            </div>
          ) : (
            // File preview
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  {previewUrl && (
                    <Image 
                      src={previewUrl} 
                      alt="Flyer preview" 
                      className="max-w-full max-h-48 rounded-lg shadow-lg object-contain"
                    />
                  )}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    variant="outline"
                    size="sm"
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 bg-red-500 hover:bg-red-600 border-red-500 text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileImage className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">{uploadedFile.name}</span>
                </div>
                <p className="text-sm text-gray-400">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </Card>

      {/* Process Button */}
      {uploadedFile && !success && (
        <div className="mt-6 text-center">
          <Button
            onClick={processFlyer}
            disabled={isProcessing}
            className="h-12 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isProcessing ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <Brain className="w-5 h-5" />
                <span>AI Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                <span>Extract Event Info</span>
              </div>
            )}
          </Button>
        </div>
      )}

      {/* Success Message */}
      {success && extractedEvent && (
        <Card className="mt-6 p-6 bg-green-500/10 border-green-400">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">
                Event Extracted Successfully!
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-300">Title: </span>
                  <span className="text-white font-medium">{extractedEvent.title}</span>
                </div>
                {extractedEvent.description && (
                  <div>
                    <span className="text-gray-300">Description: </span>
                    <span className="text-white">{extractedEvent.description}</span>
                  </div>
                )}
                {extractedEvent.tags && extractedEvent.tags.length > 0 && (
                  <div>
                    <span className="text-gray-300">Tags: </span>
                    <span className="text-white">{extractedEvent.tags.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="mt-6 p-4 bg-red-500/10 border-red-400">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-200">{error}</span>
          </div>
        </Card>
      )}
    </div>
  );
}; 