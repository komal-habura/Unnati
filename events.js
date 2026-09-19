(function(){
  function el(html){
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    return wrapper.firstChild;
  }

  function formatDateParts(dateStr){
    const d = new Date(dateStr + 'T00:00:00');
    if(Number.isNaN(d.getTime())) return null;
    return {
      iso: dateStr,
      day: String(d.getDate()).padStart(2,'0'),
      month: d.toLocaleString(undefined, { month: 'short' }),
     year: String(d.getFullYear())
    };
  }

  // Parse common date formats into ISO yyyy-mm-dd used by the renderer
  function parseDateToISO(s){
    if(!s) return null;
    s = String(s).trim();
    // If already ISO-like
    if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // dd-mm-yyyy or dd/mm/yyyy
    let m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if(m){
      const dd = m[1].padStart(2,'0');
      const mm = m[2].padStart(2,'0');
      const yyyy = m[3];
      return `${yyyy}-${mm}-${dd}`;
    }
    // mm-dd-yyyy
    m = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if(m){
      // fallback handled above (same regex) — keep as-is
      const parts = s.split(/[-\/]/);
      if(parts[0].length===4) return s; // unknown
    }
    // Excel serial number (days since 1899-12-31)
    if(/^\d+$/.test(s)){
      const serial = parseInt(s,10);
      // Excel leap year bug handling: assume 1900 system
      const excelEpoch = new Date(Date.UTC(1899,11,30));
      const d = new Date(excelEpoch.getTime() + serial * 24*60*60*1000);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth()+1).padStart(2,'0');
      const dd = String(d.getUTCDate()).padStart(2,'0');
      return `${yyyy}-${mm}-${dd}`;
    }
    // Last resort: try Date.parse
    const dt = new Date(s);
    if(!isNaN(dt.getTime())){
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth()+1).padStart(2,'0');
      const dd = String(dt.getDate()).padStart(2,'0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return null;
  }

  function normalizeImageUrl(image){
    if(!image) return '';
    const raw = String(image).trim();
    if(!raw) return '';

    const driveMatch = raw.match(/(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=|id=)([a-zA-Z0-9_-]+)/i) ||
      raw.match(/(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=|id=)([a-zA-Z0-9_-]+)/i);

    if(driveMatch && driveMatch[1]){
      return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }

    return raw;
  }

  function createCard(event){
    const dateParts = formatDateParts(event.date) || { day: event.day || '', month: event.month || '', year: event.year || '' };
    const safeImage = normalizeImageUrl(typeof event.image === 'string' ? event.image : '');
    const img = safeImage || '';
    const tag = event.tag || '';

    const buttonHref = event.isPast
      ? (event.recapLink || event.registrationLink || '#')
      : (event.registrationLink || '#');
    const targetAttribute = buttonHref && buttonHref !== '#' ? 'target="_blank" rel="noopener noreferrer"' : '';
    const buttonLabel = event.isPast ? 'See Recap' : 'Register Now';

    const html = `
      <article class="card">
        ${img ? `<img src="${img}" alt="${(event.title||'') }" loading="lazy">` : ''}
        <div class="card-body">
          ${tag?`<span class="story-tag">${tag}</span>`:''}
          <h3>${event.title || ''}</h3>
          <p>${event.description || ''}</p>
          <div class="card-meta">
            📅 <strong>Date:</strong>${dateParts.day} ${dateParts.month || ''} ${dateParts.year || ''}<br>
            ${event.location?`📍 <strong>Venue:</strong> ${event.location}`:''}
          </div>
          <a class="btn ${event.isPast? 'btn-outline':'btn-primary'}" href="${buttonHref}" ${targetAttribute}>${buttonLabel}</a>
        </div>
      </article>`;

    return el(html);
  }

  // function categorizeEvents(items){
  //   const today = new Date();
  //   today.setHours(0,0,0,0);
  //   const upcoming = [], current = [], past = [];
    
  //   items.forEach(it => {
  //     const d = new Date(it.date + 'T00:00:00');
  //     if(isNaN(d.getTime())){ past.push(Object.assign({}, it, { isPast:true })); return; }
  //     d.setHours(0,0,0,0);
      
  //     // Changed > to >= so today's events go directly into upcoming
  //     if(d.getTime() >= today.getTime()) {
  //       upcoming.push(it);
  //     } else {
  //       past.push(Object.assign({}, it, { isPast:true }));
  //     }
  //   });
    
  //   // sort upcoming ascending, past descending
  //   upcoming.sort((a,b)=> new Date(a.date) - new Date(b.date));
  //   past.sort((a,b)=> new Date(b.date) - new Date(a.date));
    
  //   return { upcoming, current, past };
  // }

  function categorizeEvents(items){
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Create our 30-day limit
    const limitDate = new Date(today);
    limitDate.setDate(today.getDate() + 30);
    
    const upcoming = [], current = [], past = [];
    
    items.forEach(it => {
      const d = new Date(it.date + 'T00:00:00');
      if(isNaN(d.getTime())){ past.push(Object.assign({}, it, { isPast:true })); return; }
      d.setHours(0,0,0,0);
      
      if(d.getTime() >= today.getTime()) {
        // Only add to upcoming if it's within the 30-day window
        if (d.getTime() <= limitDate.getTime()) {
          upcoming.push(it);
        }
      } else {
        // Less than today goes to past
        past.push(Object.assign({}, it, { isPast:true }));
      }
    });
    
    // sort upcoming ascending, past descending
    upcoming.sort((a,b)=> new Date(a.date) - new Date(b.date));
    past.sort((a,b)=> new Date(b.date) - new Date(a.date));
    
    return { upcoming, current, past };
  }

  function renderList(containerId, items){
    const c = document.getElementById(containerId);
    if(!c) return;
    c.innerHTML = '';
    if(!items || items.length===0){ return; }
    items.forEach(it=> c.appendChild(createCard(it)));
  }

  function normalizeGoogleSheetCsvUrl(rawUrl){
    if(!rawUrl) return null;
    const trimmed = String(rawUrl).trim();
    if(!trimmed) return null;

    const match = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/i);
    if(!match) return trimmed;

    const sheetId = match[1];
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
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
      .then(r=>{ if(!r.ok) throw new Error('Failed to fetch events.json'); return r.json(); });
  }

  function load(){
    // Try to fetch from a published Google Sheets CSV first (set SHEET_CSV_URL),
    // otherwise fall back to local events.json.
    const SHEET_CSV_URL = normalizeGoogleSheetCsvUrl(window.SHEET_CSV_URL || null); // set this globally if you want live sheet updates

    function useData(items){
      const { upcoming, current, past } = categorizeEvents(items);
      renderList('upcoming-list', upcoming);
      renderList('current-list', current);
      renderList('past-list', past);
    }

    if(SHEET_CSV_URL && window.Papa){
      fetch(SHEET_CSV_URL)
        .then(r=>{ if(!r.ok) throw new Error('Failed to fetch sheet CSV'); return r.text(); })
        .then(text=>{
          const parsed = Papa.parse(text, { header: true, skipEmptyLines: 'greedy' });
          const rows = parsed.data
            .map(row => {
              const normalized = {};
              Object.keys(row || {}).forEach(key => {
                normalized[String(key).trim()] = row[key];
              });
              return normalized;
            })
            .filter(r => r['Event Name'] || r['Event Date'] || r.title).map(r => {
            // Accept multiple header names coming from your sheet
            const dateRaw = r['Event Date'] || r['event date'] || r.date || r['Date'] || r['EventDate'];
            const title = r['Event Name'] || r['event name'] || r.title || r['EventName'] || r['Event'];
            const description = r['Description'] || r.description || '';
            const location = r['Location'] || r.location || '';
            const image = r['Image URL'] || r['Image Url'] || r['image url'] || r.image || '';
            const theme = r['Theme'] || r.theme || '';
            const type = r['Type'] || r.type || '';
            const registrationLink = r['Registration Link'] || r['registration link'] || r.registrationLink || r['RegistrationLink'] || '';
            const recapLink = r['Recap URL'] || r['recap url'] || r.recapLink || r['RecapURL'] || '';
            const slug = (r['slug'] || r.slug) || (title ? title.toString().toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/gi,'') : '');
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
        .catch(err=>{
          console.warn('Sheet CSV load failed, falling back to embedded/local data', err);
          useEmbeddedDataOrFetch()
            .then(useData)
            .catch(e=>{
              console.error(e);
              document.getElementById('upcoming-list').innerHTML = '';
            });
        });
      return;
    }

    // Default: load embedded data when opened directly from disk or fetch local JSON otherwise.
    useEmbeddedDataOrFetch()
      .then(useData)
      .catch(err=>{
        console.error(err);
        document.getElementById('upcoming-list').innerHTML = '';
        document.getElementById('current-list').innerHTML = '';
        document.getElementById('past-list').innerHTML = '';
      });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
