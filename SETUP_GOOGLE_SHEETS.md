# Google Sheets Integration Setup Guide

## Overview
Your website will now automatically pull event data from a Google Sheet. Whenever you edit the sheet, changes appear on your website instantly!

---

## Step 1: Create a Google Sheet Template

### 1.1 Create New Sheet
1. Go to **[Google Sheets](https://sheets.google.com)**
2. Click **"+ New"** → **Blank spreadsheet**
3. Name it: **"Unnati Events"**

### 1.2 Set Up Column Headers
Create a sheet named **"Events"** with these exact column headers in Row 1:

| eventId | title | description | date | venue | type | image | tag | status | registrationEmail | registrationLink | additional |
|---------|-------|-------------|------|-------|------|-------|-----|--------|------------------|-----------------|------------|
| 1 | Ecstatic Youth Kirtan Mela | Gather for joyful chanting... | Sun, Sep 15 | ISKCON Main Hall | In-Person | images/events/kirtan_girls_event.png | 🎵 In-Person | upcoming | Iysgirlschennai@gmail.com | | |

### 1.3 Add Sample Events

Copy these sample rows into your sheet (starting from Row 2):

**Upcoming Events:**
```
1,Ecstatic Youth Kirtan Mela,Gather for joyful chanting and community singing,Sun Sep 15,ISKCON Main Hall,In-Person,images/events/kirtan_girls_event.png,🎵 In-Person,upcoming,Iysgirlschennai@gmail.com,,
2,Gita for Modern Life,Join our 4-week online course for practical spiritual habits,Tue Sep 18,Zoom,Online,images/events/girls_meditation_peace_1773062416789.png,💻 Online,upcoming,Iysgirlschennai@gmail.com,,
3,Women's Leadership Workshop,Build confidence and service skills with young women,Sat Sep 22,Community Center,Workshop,images/events/community_workshop.jpg,🧠 Workshop,upcoming,Iysgirlschennai@gmail.com,,
```

**Current Events:**
```
4,Weekly Bhakti Circle,Weekly group discussion and chanting circle,Every Thursday 6 PM,Temple Hall,Ongoing,images/events/recent_discussion.png,✨ Ongoing,current,Iysgirlschennai@gmail.com,,
5,Community Service Drive,Support local families through seva,This Week,Local Outreach Center,Service,images/events/devotional_art.png,❤️ Service,current,Iysgirlschennai@gmail.com,,
6,Daily Meditation Circle,Daily group meditation and conversation,Daily 7 AM,Garden Pavilion,Ongoing,images/events/meditation_circle.png,🧘‍♀️ Ongoing,current,Iysgirlschennai@gmail.com,,
```

**Past Events:**
```
7,Youth Devotional Festival,A joyful celebration with kirtan and dance,Sep 1,Temple Grounds,Festival,images/events/past_youth_festival.png,🎉 Recap,past,Iysgirlschennai@gmail.com,,
8,Wellness & Leadership Workshop,Training on confidence and leadership,Aug 25,Community Hall,Workshop,images/events/past_wellness_workshop.png,🕊️ Recap,past,Iysgirlschennai@gmail.com,,
9,Evening Kirtan Gathering,A beautiful devotional evening,Aug 18,Meditation Hall,Gathering,images/events/past_kirtan_evening.png,🎶 Recap,past,Iysgirlschennai@gmail.com,,
```

---

## Step 2: Get Your Google Sheet ID

1. Open your Google Sheet
2. Look at the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit#...
   ```
3. Copy the **SHEET_ID** (long string between `/d/` and `/edit`)
4. **Save this ID** - you'll need it next

**Example:**
```
https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p/edit#gid=0
                                     └─ SHEET_ID ─────────────────────────────┘
```

---

## Step 3: Enable Google Sheets API & Get API Key

### 3.1 Create a Google Cloud Project
1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**
2. Click **"Create Project"**
3. Name it: **"Unnati"**
4. Click **Create**

### 3.2 Enable Google Sheets API
1. Search for **"Google Sheets API"**
2. Click **Enable**

### 3.3 Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **API Key**
3. Copy the API Key
4. **Click "Restrict Key"** and:
   - Set **API restrictions** → Select **Google Sheets API only**
   - Set **Application restrictions** → HTTP referrers (websites)
   - Add: `https://unnati.com` (your domain) and `http://localhost:*` (for testing)

---

## Step 4: Update Your Website Code

### 4.1 Open `events-data.js`
Edit the file at: `/Users/inuguria/Documents/Unnati/Unnati/events-data.js`

### 4.2 Update These Two Lines

**Line 2:**
```javascript
const GOOGLE_SHEET_ID = 'YOUR_SHEET_ID_HERE'; // Replace with your actual Sheet ID
```
Change to:
```javascript
const GOOGLE_SHEET_ID = '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p'; // Your actual Sheet ID
```

**Line 4:**
```javascript
const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API Key
```
Change to:
```javascript
const API_KEY = 'AIzaSyD_abc123xyz456...'; // Your actual API Key
```

### 4.3 Save the file

---

## Step 5: Test It!

1. Start your local server:
   ```bash
   cd /Users/inuguria/Documents/Unnati/Unnati
   python3 -m http.server 8000
   ```

2. Open browser: `http://localhost:8000/events.html`

3. You should see your events from Google Sheets!

4. **Try editing** an event in Google Sheets and refresh the page - it updates instantly! ✨

---

## Column Reference

| Column | Description | Example |
|--------|-------------|---------|
| **eventId** | Unique ID for event | 1, 2, 3... |
| **title** | Event name | Ecstatic Youth Kirtan Mela |
| **description** | Short description | Gather for joyful chanting... |
| **date** | Event date/time | Sun Sep 15, Every Thursday 6 PM |
| **venue** | Location | ISKCON Main Hall, Zoom |
| **type** | Event type | In-Person, Online, Workshop |
| **image** | Path to image file | images/events/kirtan_girls_event.png |
| **tag** | Display tag with emoji | 🎵 In-Person, 💻 Online |
| **status** | Event status | upcoming, current, past |
| **registrationEmail** | Email for registrations | Iysgirlschennai@gmail.com |
| **registrationLink** | Optional registration link | https://form.google.com/... |
| **additional** | Extra info (optional) | Any additional details |

---

## How to Add a New Event

1. Open your Google Sheet: **[Unnati Events](https://docs.google.com/spreadsheets)**
2. Add a new row with:
   - **eventId**: Next number (10, 11, 12...)
   - **title**: Event name
   - **description**: Short description
   - **date**: Date/time
   - **venue**: Location
   - **type**: In-Person, Online, Workshop, etc.
   - **image**: Path to image (e.g., `images/events/my_event.png`)
   - **tag**: Emoji + label (e.g., `🎵 In-Person`)
   - **status**: upcoming, current, or past
   - **registrationEmail**: Where to send registrations
3. **Refresh your website** - event appears automatically!

---

## Troubleshooting

### Events not showing?
1. Check browser console for errors (F12)
2. Verify Sheet ID is correct
3. Verify API Key is correct
4. Make sure Google Sheets API is enabled
5. Check that your domain/localhost is in API Key restrictions

### API Key error?
- Make sure you enabled "Google Sheets API" (not just created the key)
- Check that HTTP referrers restriction is set correctly

### Images not loading?
- Make sure image paths are correct (e.g., `images/events/filename.png`)
- Check that images exist in your `images/events/` folder

---

## Security Note

Your API Key is visible in the page source. This is okay because:
- ✅ The key is **read-only** (can only read Google Sheets)
- ✅ It's **restricted** to your domain and Google Sheets API only
- ✅ Anyone can view your events anyway (it's a public website)

---

## Need Help?

Share your Google Sheet link with the team:
- Open your sheet
- Click **Share** (top right)
- Set to **"Viewer"** access
- Send link to team members

They can see all events and you can manage them from one place!

---

## Next Steps (Optional)

Want to make it even easier? Consider:
- 📝 Creating a **Google Form** for adding events (auto-fills the sheet)
- 🔔 Adding **email notifications** when events are created
- 📊 Adding **filters** to show only upcoming events
- 🎨 Adding **event categories/colors**
