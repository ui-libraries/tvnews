// Debug script to check if R key events are being recorded
console.log('🔍 DEBUGGING R KEY EVENTS');

console.log('\n📊 Current localStorage data:');
const storedData = localStorage.getItem('videoValues');
if (storedData) {
  const data = JSON.parse(storedData);
  console.log(`Total events stored: ${data.length}`);

  // Check for R key events
  const rKeyEvents = data.filter(event => event["Event Type"] === "SPONSOR_IDENTIFIED");
  console.log(`R key events found: ${rKeyEvents.length}`);

  if (rKeyEvents.length > 0) {
    console.log('\nSample R key events:');
    rKeyEvents.slice(0, 3).forEach((event, index) => {
      console.log(`${index + 1}. ${JSON.stringify(event, null, 2)}`);
    });
  }

  // Check for slider events
  const sliderEvents = data.filter(event => !event["Event Type"] || event["Event Type"] !== "SPONSOR_IDENTIFIED");
  console.log(`Slider events found: ${sliderEvents.length}`);

  if (sliderEvents.length > 0) {
    console.log('\nSample slider events:');
    sliderEvents.slice(0, 2).forEach((event, index) => {
      console.log(`${index + 1}. ${JSON.stringify(event, null, 2)}`);
    });
  }

} else {
  console.log('❌ No videoValues found in localStorage');
}

// Simulate what the CSV export would do
console.log('\n📄 Simulating CSV Export Logic:');

// Mock current video and user ID (since we can't access them in this context)
const mockCurrentVideoId = "993628952"; // Example
const mockUserId = "testuser"; // Example

if (storedData) {
  let data = JSON.parse(storedData);

  // Filter for current user and current ad only (like the export function does)
  data = data.filter(row => row["User ID"] === mockUserId && row["Video ID"] === mockCurrentVideoId);

  console.log(`Filtered data for user "${mockUserId}" and video "${mockCurrentVideoId}": ${data.length} events`);

  if (data.length > 0) {
    // Define standard columns for CSV export
    const columns = ["Seconds", "Event Type", "Likert Value", "Video ID", "User ID", "Timestamp"];

    const replacer = (key, value) => value === null ? '' : value;

    // Create CSV rows with consistent column structure
    let csv = data.map(row => {
      return columns.map(field => {
        const value = row[field];
        return value !== undefined ? JSON.stringify(value, replacer) : '';
      }).join(',');
    });

    // Add header
    csv.unshift(columns.join(','));
    const csvContent = csv.join('\r\n');

    console.log('\nGenerated CSV:');
    console.log(csvContent);
  } else {
    console.log('❌ No data matches the current user/video filter');
  }
}

console.log('\n🔧 TROUBLESHOOTING:');
console.log('1. Make sure you\'re pressing the R key during video playback');
console.log('2. Check browser console for "Sponsor identified at" messages');
console.log('3. Verify user ID is set correctly in localStorage');
console.log('4. Ensure you\'re on the same video when exporting CSV');
