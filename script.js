const fs = require('fs');
const ics = require('ics');
const csv = require('csv-parser');
// Path to CSV file
const csvFilePath = 'data.csv';

// Array to store events
const events = [];

// Function to read CSV and create iCal file
fs.createReadStream(csvFilePath)
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    // Create event based on CSV row
    const startDate = row['Start Date'].split('-').map(Number);

    events.push({
      title: row['Subject'],
      start: [...startDate], // Start date as [YYYY, MM, DD, HH, MM]
      end: [...startDate], // All-day event
      description: row['Description'],
      status: 'CONFIRMED',
      busyStatus: 'FREE', // Does not block calendar
      alarms: [
        {
          action: 'display',
          description: `Reminder: ${row['Subject']}`,
          trigger: {
            before: true,
            days: 0,
            hours: 6, // Set notification hour
          },
        },
      ],
    });
  })
  .on('end', () => {
    // Generate iCal file
    ics.createEvents(events, (error, value) => {
      if (error) {
        console.log(error);
        return;
      }
      fs.writeFileSync('calendar.ics', value);
      console.log('File iCal generated: calendar.ics');
    });
  });
