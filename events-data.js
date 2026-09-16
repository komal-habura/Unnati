// Google Sheets Configuration
const GOOGLE_SHEET_ID = '1-HklffkP3eydXVbnXIYHdHEd3Q8UdcPp3oTJ4hk8jHw'; // You'll replace this with your actual Sheet ID
const SHEET_NAME = 'Sheet1'; // Name of the sheet tab (the tab at the bottom of the sheet, not the file name)
const API_KEY = 'AIzaSyBWCsRLRVRVIQhRoJ12KXfTRBYZZ4O8QCU'; // You'll get this from Google Cloud

// Fetch events from Google Sheets
async function fetchEventsFromSheet() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}&valueRenderOption=FORMATTED_VALUE`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length < 2) {
      console.warn('No event data found in Google Sheet');
      return { upcoming: [], current: [], past: [] };
    }

    // Parse headers (first row)
    const headers = rows[0];
    const events = [];

    // Parse data rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const event = {
        eventId: row[headers.indexOf('eventId')] || '',
        title: row[headers.indexOf('title')] || '',
        description: row[headers.indexOf('description')] || '',
        date: row[headers.indexOf('date')] || '',
        venue: row[headers.indexOf('venue')] || '',
        type: row[headers.indexOf('type')] || '', // 'In-Person', 'Online', 'Workshop'
        image: row[headers.indexOf('image')] || '',
        tag: row[headers.indexOf('tag')] || '', // emoji + label like "🎵 In-Person"
        status: row[headers.indexOf('status')] || 'upcoming', // 'upcoming', 'current', 'past'
        registrationEmail: row[headers.indexOf('registrationEmail')] || 'Iysgirlschennai@gmail.com',
        registrationLink: row[headers.indexOf('registrationLink')] || '', // optional, if provided use this instead of email
        additional: row[headers.indexOf('additional')] || '' // any extra info
      };

      if (event.title) events.push(event);
    }

    // Categorize events by status
    const categorized = {
      upcoming: events.filter(e => e.status === 'upcoming'),
      current: events.filter(e => e.status === 'current'),
      past: events.filter(e => e.status === 'past')
    };

    console.log('Events loaded:', categorized);
    return categorized;
  } catch (error) {
    console.error('Error fetching events from Google Sheets:', error);
    return { upcoming: [], current: [], past: [] };
  }
}

// Convert a Google Drive share link into a direct image URL the browser can render.
// Accepts links like:
//   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
//   https://drive.google.com/open?id=FILE_ID
// Leaves local paths (images/events/...) and normal image URLs untouched.
function resolveImageUrl(image) {
  if (!image) return 'images/events/event_home.jpg';

  const driveMatch = image.match(/drive\.google\.com\/(?:file\/d\/([\w-]+)|open\?id=([\w-]+))/);
  if (driveMatch) {
    const fileId = driveMatch[1] || driveMatch[2];
    return `https://lh3.googleusercontent.com/d/${fileId}=w1200`;
  }

  return image;
}

// Create event card HTML
function createEventCard(event, category) {
  const actionText = category === 'past' ? 'See Recap' : 'Register Now';
  const actionClass = category === 'past' ? 'btn-outline' : 'btn-primary';

  const registrationHref = event.registrationLink
    ? event.registrationLink
    : `mailto:${event.registrationEmail}?subject=Register%20for%20${encodeURIComponent(event.title)}`;

  return `
    <article class="card">
      <img src="${resolveImageUrl(event.image)}" alt="${event.title}" loading="lazy" onerror="this.onerror=null;this.src='images/events/event_home.jpg'">
      <div class="card-body">
        <span class="story-tag">${event.tag}</span>
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <div class="card-meta">
          ${event.date ? `📅 <strong>Date:</strong> ${event.date}<br>` : ''}
          ${event.venue ? `📍 <strong>Venue:</strong> ${event.venue}` : ''}
        </div>
        <a class="btn ${actionClass}" href="${registrationHref}">${actionText}</a>
      </div>
    </article>
  `;
}

// Render events on page
async function renderEvents() {
  const events = await fetchEventsFromSheet();

  // Render Upcoming Events
  const upcomingContainer = document.querySelector('#upcoming-events .grid-3');
  if (upcomingContainer) {
    upcomingContainer.innerHTML = events.upcoming.length > 0
      ? events.upcoming.map(e => createEventCard(e, 'upcoming')).join('')
      : '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted);">No upcoming events yet. Check back soon!</p>';
  }

  // Render Current Events
  const currentContainer = document.querySelector('#current-events .grid-3');
  if (currentContainer) {
    currentContainer.innerHTML = events.current.length > 0
      ? events.current.map(e => createEventCard(e, 'current')).join('')
      : '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted);">No current events at this time.</p>';
  }

  // Render Past Events
  const pastContainer = document.querySelector('#past-events .grid-3');
  if (pastContainer) {
    pastContainer.innerHTML = events.past.length > 0
      ? events.past.map(e => createEventCard(e, 'past')).join('')
      : '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted);">No past events to display.</p>';
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderEvents);
} else {
  renderEvents();
}
