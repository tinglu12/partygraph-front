import { convertDayOfWeekToDate, isDayOfWeekFormat } from './dateConversion';

/**
 * Quick test to verify date conversion works
 * Run this in console to verify the conversion logic
 */
export function testDateConversion() {
  const testCases = [
    "THURSDAY 3:00 PM",
    "WEDNESDAY 6:30 PM", 
    "FRIDAY 6:00 PM",
    "MONDAY 8:30 AM",
    "SATURDAY 2:00 PM"
  ];

  console.log('Testing day-of-week to date conversion:');
  console.log('=====================================');
  
  testCases.forEach(dayString => {
    const isFormat = isDayOfWeekFormat(dayString);
    const converted = convertDayOfWeekToDate(dayString);
    const readableDate = converted ? new Date(converted).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }) : 'null';
    
    console.log(`"${dayString}" -> ${converted} (${readableDate})`);
  });
  
  console.log('\nExpected mapping for NY Tech Week 2025:');
  console.log('Monday = June 2, Tuesday = June 3, Wednesday = June 4');
  console.log('Thursday = June 5, Friday = June 6, Saturday = June 7, Sunday = June 8');
} 