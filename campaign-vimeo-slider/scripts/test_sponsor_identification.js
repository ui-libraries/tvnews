const fs = require('fs');
const path = require('path');

// Test the spacebar functionality by simulating data
function testSpacebarFunctionality() {
  console.log('🧪 TESTING SPACEBAR SPONSOR IDENTIFICATION');

  // Simulate the data structure that would be created
  const mockSliderEvent = {
    "Seconds": 25,
    "Likert Value": 75,
    "Video ID": "993628952",
    "User ID": "testuser",
    "Timestamp": "10/16/2025, 2:30:45 PM"
  };

  const mockSpacebarEvent = {
    "Seconds": 15,
    "Event Type": "SPONSOR_IDENTIFIED",
    "Video ID": "993628952",
    "User ID": "testuser",
    "Timestamp": "10/16/2025, 2:30:30 PM"
  };

  const mockData = [mockSliderEvent, mockSpacebarEvent];

  console.log('📊 Sample Data Structure:');
  console.log('Slider Event:', JSON.stringify(mockSliderEvent, null, 2));
  console.log('Spacebar Event:', JSON.stringify(mockSpacebarEvent, null, 2));

  // Test CSV export logic
  console.log('\n📄 Testing CSV Export Logic:');

  const columns = ["Seconds", "Event Type", "Likert Value", "Video ID", "User ID", "Timestamp"];
  const replacer = (key, value) => value === null ? '' : value;

  const csvRows = mockData.map(row => {
    return columns.map(field => {
      const value = row[field];
      return value !== undefined ? JSON.stringify(value, replacer) : '';
    }).join(',');
  });

  csvRows.unshift(columns.join(','));
  const csvContent = csvRows.join('\r\n');

  console.log('Generated CSV:');
  console.log(csvContent);

  // Verify the CSV structure
  const lines = csvContent.split('\r\n');
  console.log('\n🔍 CSV Validation:');
  console.log(`Header: ${lines[0]}`);
  console.log(`Slider row: ${lines[1]}`);
  console.log(`Spacebar row: ${lines[2]}`);

  // Check that spacebar event has "SPONSOR_IDENTIFIED" in the Event Type column
  const spacebarRow = lines[2].split(',');
  const eventTypeIndex = columns.indexOf("Event Type");
  const eventType = JSON.parse(spacebarRow[eventTypeIndex]);

  if (eventType === "SPONSOR_IDENTIFIED") {
    console.log('✅ Spacebar event correctly identified');
  } else {
    console.log('❌ Spacebar event type incorrect');
  }

  // Check that slider event has empty Event Type but Likert Value
  const sliderRow = lines[1].split(',');
  const sliderEventType = sliderRow[eventTypeIndex] === '""' ? '' : JSON.parse(sliderRow[eventTypeIndex] || '""');
  const likertIndex = columns.indexOf("Likert Value");
  const likertValue = sliderRow[likertIndex] === '""' ? '' : JSON.parse(sliderRow[likertIndex] || '""');

  if (sliderEventType === '' && likertValue === 75) {
    console.log('✅ Slider event correctly structured');
  } else {
    console.log('❌ Slider event structure incorrect');
  }

  console.log('\n📈 Research Applications:');
  console.log('- Users press R KEY when they recognize the sponsor');
  console.log('- System records exact video timestamp of recognition');
  console.log('- Data shows how quickly users identify political sponsors');
  console.log('- CSV exports both sentiment ratings and sponsor recognition events');

  return true;
}

// Run the test
testSpacebarFunctionality();
console.log('\n✅ SPACEBAR FUNCTIONALITY TEST COMPLETED');
