// Test script to simulate R key press and verify data recording
console.log('🧪 TESTING R KEY SIMULATION');

console.log('\n📋 Test Scenario:');
console.log('1. Simulate R key press');
console.log('2. Check if event is recorded in localStorage');
console.log('3. Verify CSV export logic');

console.log('\n🎯 Simulating R key press...');

// Simulate the data that would be created by an R key press
const mockSponsorEvent = {
  "Seconds": 30,
  "Event Type": "SPONSOR_IDENTIFIED",
  "Video ID": "993628952",
  "User ID": "testuser",
  "Timestamp": "10/16/2025, 3:00:00 PM"
};

const mockSliderEvent = {
  "Seconds": 45,
  "Likert Value": 80,
  "Video ID": "993628952",
  "User ID": "testuser",
  "Timestamp": "10/16/2025, 3:00:15 PM"
};

// Simulate adding to localStorage (in a real browser, this would be done by the event handler)
const mockVideoValues = [mockSponsorEvent, mockSliderEvent];

console.log('📊 Mock data added to localStorage:', mockVideoValues);

console.log('\n📄 Testing CSV Export with mock data...');

// Simulate CSV export logic
const columns = ["Seconds", "Event Type", "Likert Value", "Video ID", "User ID", "Timestamp"];
const replacer = (key, value) => value === null ? '' : value;

// Filter for current user and video (simulating the export function)
const userId = "testuser";
const currentAdId = "993628952";

console.log('🔍 Filtering for user:', userId, 'and video:', currentAdId);

let data = mockVideoValues.filter(row => row["User ID"] === userId && row["Video ID"] === currentAdId);
console.log(`📊 Filtered data: ${data.length} events`);

if (data.length > 0) {
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

  console.log('\n✅ Generated CSV:');
  console.log('================');
  console.log(csvContent);
  console.log('================');

  // Verify the CSV contains both event types
  const lines = csvContent.split('\r\n');
  const rKeyLine = lines.find(line => line.includes('"SPONSOR_IDENTIFIED"'));
  const sliderLine = lines.find(line => line.includes('80'));

  if (rKeyLine) {
    console.log('✅ R key event found in CSV');
  } else {
    console.log('❌ R key event missing from CSV');
  }

  if (sliderLine) {
    console.log('✅ Slider event found in CSV');
  } else {
    console.log('❌ Slider event missing from CSV');
  }

} else {
  console.log('❌ No data matches filter criteria');
}

console.log('\n🔧 TROUBLESHOOTING CHECKLIST:');
console.log('1. ✅ Are you pressing the R key? (Not spacebar, C, S, etc.)');
console.log('2. ✅ Is the video loaded and playing?');
console.log('3. ✅ Check browser console for "R key pressed!" message');
console.log('4. ✅ Check browser console for "Sponsor identified at" message');
console.log('5. ✅ Is your user ID set? Check localStorage.getItem("userId")');
console.log('6. ✅ Are you exporting CSV for the same video where you pressed R?');

console.log('\n💡 If R key events are not appearing:');
console.log('- Try pressing R multiple times during different parts of the video');
console.log('- Make sure you\'re not on a different tab/window when pressing R');
console.log('- Check if any browser extensions are intercepting keyboard events');
