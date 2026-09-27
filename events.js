(function(){
  function el(html){
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    return wrapper.firstChild;
  }

  function formatDateParts(dateStr){
    if(!dateStr) return null;
    const parts = dateStr.split('-');
    if(parts.length !== 3) return null;
    
    // Construct date using local parameters to avoid timezone-shift bugs
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    if(Number.isNaN(d.getTime())) return null;

    return {
      iso: dateStr,
      day: String(d.getDate()).padStart(2, '0'),
      month: d.toLocaleString('en-US', { month: 'short' }),
      year: String(d.getFullYear())
    };
  }

  // Parse common date formats into ISO YYYY-MM-DD
  function parseDateToISO(s){
    if(!s) return null;
    s = String(s).trim();

    // Already YYYY-MM-DD
    if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    // Matches DD-MM-YYYY or DD/MM/YYYY
    let m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if(m){
      let p1 = parseInt(m[1], 10);
      let p2 = parseInt(m[2], 10);
      const yyyy = m[3];

      let day, month;
      if(p1 > 12) {
        day = p1;
        month = p2;
      } else if (p2 > 12) {
        month = p1;
        day = p2;
      } else {
        // Defaults to DD-MM-YYYY standard
        day = p1;
        month = p2;
      }

      return `${yyyy}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Excel serial number (days since 1899-12-30)
    if(/^\d+$/.test(s)){
      const serial = parseInt(s, 10);
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const d = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    // Fallback: standard Date.parse
    const dt = new Date(s);
    if(!isNaN(dt.getTime())){
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return null;
  }

  // Uses Google's thumbnail CDN to prevent image embed blocking
  function normalizeImageUrl(image){
    if(!image) return '';
    const raw = String(image).trim();
    if(!raw) return '';

    const driveMatch = raw.match(/(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=|id=)([a-zA-Z0-9_-]+)/i);
    if(driveMatch && driveMatch[1]){
      return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`;
    }

    return raw;
  }

  function createCard(event){
    const dateParts = formatDateParts(event.date) || { 
      day: event.day || '', 
      month: event.month || '', 
      year: event.year || '' 
    };
    const safeImage = normalizeImageUrl(typeof event.image === 'string' ? event.image : '');
    const tag = event.tag || '';

    const buttonHref = event.isPast
      ? (event.recapLink || event.registrationLink || '#')
      : (event.registrationLink || '#');
    const targetAttribute = buttonHref && buttonHref !== '#' ? 'target="_blank" rel="noopener noreferrer"' : '';
    const buttonLabel = event.isPast ? 'See Recap' : 'Register Now';

    const html = `
      <article class="card">
        ${safeImage ? `<img src="${safeImage}" alt="${(event.title || '')}" loading="lazy">` : ''}
        <div class="card-body">
          ${tag ? `<span class="story-tag">${tag}</span>` : ''}
          <h3>${event.title || ''}</h3>
          <p>${event.description || ''}</p>
          <div class="card-meta">
            📅 <strong>Date:</strong> ${dateParts.day} ${dateParts.month || ''} ${dateParts.year || ''}<br>
            ${event.location ? `📍 <strong>Venue:</strong> ${event.location}` : ''}
          </div>
          <a class="btn ${event.isPast ? 'btn-outline' : 'btn-primary'}" href="${buttonHref}" ${targetAttribute}>${buttonLabel}</a>
        </div>
      </article>`;

    return el(html);
  }

  function categorizeEvents(items){
    const now = new Date();
    // Midnight base for local system date
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // 30-day upcoming limit window
    const limitDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).getTime();

    const upcoming = [], past = [];

    items.forEach(it => {
      if(!it.date) {
        past.push(Object.assign({}, it, { isPast: true }));
        return;
      }

      const parts = it.date.split('-');
      const eventTime = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime();

      if(isNaN(eventTime)){
        past.push(Object.assign({}, it, { isPast: true }));
        return;
      }

      // Check if event is today or in the future
      if(eventTime >= today) {
        if(eventTime <= limitDate) {
          upcoming.push(it);
        }
      } else {
        past.push(Object.assign({}, it, { isPast: true }));
      }
    });

    // Upcoming: earliest first; Past: most recent first
    upcoming.sort((a, b) => new Date(a.date.replace(/-/g, '/')) - new Date(b.date.replace(/-/g, '/')));
    past.sort((a, b) => new Date(b.date.replace(/-/g, '/')) - new Date(a.date.replace(/-/g, '/')));

    return { upcoming, current: [], past };
  }

  function renderList(containerId, items){
    const c = document.getElementById(containerId);
    if(!c) return;
    c.innerHTML = '';
    if(!items || items.length === 0) return;
    items.forEach(it => c.appendChild(createCard(it)));
  }

  function normalizeGoogleSheetCsvUrl(rawUrl){
    if(!rawUrl) return null;
    let url = String(rawUrl).trim();

    if (url.includes('/pubhtml')) {
      return url.replace(/\/pubhtml.*$/, '/pub?output=csv');
    }
    if (url.includes('/pub') && !url.includes('output=csv')) {
      return url + (url.includes('?') ? '&output=csv' : '?output=csv');
    }
    if (url.includes('/pub?output=csv')) {
      return url;
    }

    const match = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/i);
    if (match) {
      return `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:csv`;
    }

    return url;
  }

  function useEmbeddedDataOrFetch(){
    const hasSheetUrl = !!normalizeGoogleSheetCsvUrl(window.SHEET_CSV_URL || null);
    if(!hasSheetUrl && Array.isArray(window.EVENTS_DATA) && window.EVENTS_DATA.length){
      return Promise.resolve(window.EVENTS_DATA);
    }
    if(window.location.protocol === 'file:'){
      return Promise.resolve([]);
    }
    return fetch('events.json')
      .then(r => { if(!r.ok) throw new Error('Failed to fetch events.json'); return r.json(); });
  }

  function load(){
    const SHEET_CSV_URL = normalizeGoogleSheetCsvUrl(window.SHEET_CSV_URL || null);

    function useData(items){
      const { upcoming, past } = categorizeEvents(items);
      renderList('upcoming-list', upcoming);
      renderList('past-list', past);
    }

    if(SHEET_CSV_URL && window.Papa){
      // Appends cache-buster to bypass any browser or proxy caching
      const separator = SHEET_CSV_URL.includes('?') ? '&' : '?';
      fetch(`${SHEET_CSV_URL}${separator}_=${Date.now()}`, { cache: 'no-store' })
        .then(r => { if(!r.ok) throw new Error('Failed to fetch sheet CSV'); return r.text(); })
        .then(text => {
          const parsed = Papa.parse(text, { header: true, skipEmptyLines: 'greedy' });
          const rows = parsed.data
            .map(row => {
              const normalized = {};
              Object.keys(row || {}).forEach(key => {
                normalized[String(key).trim()] = row[key];
              });
              return normalized;
            })
            .filter(r => r['Event Name'] || r['Event Date'] || r.title)
            .map(r => {
              const dateRaw = r['Event Date'] || r['event date'] || r.date || r['Date'] || r['EventDate'];
              const title = r['Event Name'] || r['event name'] || r.title || r['EventName'] || r['Event'];
              const description = r['Description'] || r.description || '';
              const location = r['Location'] || r.location || '';
              const image = r['Image Url'] || r['Image URL'] || r['image url'] || r.image || '';
              const theme = r['Theme'] || r.theme || '';
              const type = r['Type'] || r.type || '';
              const registrationLink = r['Registration Link'] || r['registration link'] || r.registrationLink || r['RegistrationLink'] || '';
              const recapLink = r['Recap URL'] || r['recap url'] || r.recapLink || r['RecapURL'] || '';
              const slug = (r['slug'] || r.slug) || (title ? title.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/gi, '') : '');
              const dateIso = parseDateToISO(dateRaw) || '';

              return {
                date: dateIso,
                title: title || '',
                location: location || '',
                description: description || '',
                slug: slug,
                image: image || '',
                tag: theme || type || '',
                registrationLink: registrationLink || '',
                recapLink: recapLink || '',
                contact: r['contact'] || r['Contact'] || ''
              };
            });

          useData(rows);
        })
        .catch(err => {
          console.warn('Sheet CSV load failed, falling back to embedded/local data', err);
          useEmbeddedDataOrFetch()
            .then(useData)
            .catch(e => {
              console.error(e);
              const upList = document.getElementById('upcoming-list');
              if(upList) upList.innerHTML = '';
            });
        });
      return;
    }

    useEmbeddedDataOrFetch()
      .then(useData)
      .catch(err => {
        console.error(err);
        const upList = document.getElementById('upcoming-list');
        const pastList = document.getElementById('past-list');
        if(upList) upList.innerHTML = '';
        if(pastList) pastList.innerHTML = '';
      });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();