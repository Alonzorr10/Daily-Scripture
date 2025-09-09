// index.js - Final Version

let savedVerses = []; // Start with an empty array
let currentVerse = null;
let currentlyEditingVerseId = null;

// --- INITIALIZE THE APP ---
// We now use an async function to load initial data
async function initializeApp() {
  const storedVerses = await window.electronStore.get('saved-verses');
  if (storedVerses) {
    savedVerses = storedVerses;
  }
  updateSavedCount();
  updateClock();
  setInterval(updateClock, 1000);
}


function getRandomVerse(bibleData) {
  const bookIndex = Math.floor(Math.random() * bibleData.length);
  const book = bibleData[bookIndex];
  const chapters = book.chapters;
  let chapterData, chapterNum;
  if (Array.isArray(chapters)) {
    const cIdx = Math.floor(Math.random() * chapters.length);
    chapterData = chapters[cIdx];
    chapterNum = cIdx + 1;
  } else {
    const cKeys = Object.keys(chapters).map(Number).sort((a, b) => a - b);
    const cIdx = Math.floor(Math.random() * cKeys.length);
    chapterNum = cKeys[cIdx];
    chapterData = chapters[String(chapterNum)];
  }
  let verseText, verseNum;
  if (Array.isArray(chapterData)) {
    const vIdx = Math.floor(Math.random() * chapterData.length);
    verseText = chapterData[vIdx];
    verseNum = vIdx + 1;
  } else {
    const vKeys = Object.keys(chapterData).map(Number).sort((a, b) => a - b);
    const vIdx = Math.floor(Math.random() * vKeys.length);
    verseNum = vKeys[vIdx];
    verseText = chapterData[String(verseNum)];
  }
  return {
    bookName: book.name,
    chapter: chapterNum,
    verse: verseNum,
    text: verseText
  };
}

document.getElementById('generateVerse').addEventListener('click', async () => {
  try {
    const bibleData = await window.electronAPI.loadBibleData();
    const randomVerse = getRandomVerse(bibleData);
    currentVerse = {
      text: randomVerse.text,
      reference: `${randomVerse.bookName} ${randomVerse.chapter}:${randomVerse.verse}`,
      bookName: randomVerse.bookName,
      chapter: randomVerse.chapter,
      verse: randomVerse.verse
    };
    document.getElementById('verseDisplay').innerText =
      `${randomVerse.bookName} ${randomVerse.chapter}:${randomVerse.verse}\n\n${randomVerse.text}`;
    document.getElementById('saveVerse').disabled = false;
  } catch (err) {
    document.getElementById('verseDisplay').innerText = 'Error loading verse: ' + err.message;
    console.error(err);
  }
});

document.getElementById('saveVerse').addEventListener('click', async () => {
  if (!currentVerse) return;
  const isSaved = savedVerses.some(saved => saved.reference === currentVerse.reference);
  if (isSaved) {
    document.getElementById('saveVerse').disabled = true;
    return;
  }
  const savedVerse = {
    ...currentVerse,
    dateSaved: new Date().toLocaleDateString(),
    id: Date.now()
  };
  savedVerses.push(savedVerse);
  await window.electronStore.set('saved-verses', savedVerses);
  updateSavedCount();
  showNotification('Verse saved successfully! ✨');
  document.getElementById('saveVerse').disabled = true;
});

document.getElementById('savedVerse').addEventListener('click', () => {
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('savedPage').style.display = 'block';
  renderSavedVerses();
});

document.getElementById('backToMain').addEventListener('click', () => {
  document.getElementById('mainContent').style.display = 'block';
  document.getElementById('savedPage').style.display = 'none';
});

document.getElementById('clearAll').addEventListener('click', async () => {
  if (confirm('Are you sure you want to delete all saved verses?')) {
    savedVerses = [];
    await window.electronStore.set('saved-verses', savedVerses);
    updateSavedCount();
    renderSavedVerses();
  }
});

async function deleteVerse(verseId) {
  savedVerses = savedVerses.filter(verse => verse.id !== verseId);
  await window.electronStore.set('saved-verses', savedVerses);
  updateSavedCount();
  renderSavedVerses();
}

function updateSavedCount() {
  const countElement = document.getElementById('savedCount');
  if (countElement) {
    countElement.textContent = savedVerses.length;
  }
}

function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

function renderSavedVerses() {
  const container = document.getElementById('savedVersesList');
  if (savedVerses.length === 0) {
    container.innerHTML = '<div class="no-verses">No saved verses yet.</div>';
    return;
  }
  container.innerHTML = savedVerses.map(verse => `
    <div class="saved-verse-item">
      <button class="delete-btn" onclick="deleteVerse(${verse.id})">×</button>
      <div class="saved-verse-text">"${verse.text}"</div>
      <div class="saved-verse-reference">- ${verse.reference}</div>
      <div class="saved-verse-date">Saved on ${verse.dateSaved}</div>
      <button class = "journal-btn" onclick = "openJournal(${verse.id})">
        ${verse.journal ? 'View Journal' : 'Add Journal'}
      </button>
    </div>
  `).join('');
}

function openJournal(verseId){
    currentlyEditingVerseId = verseId;
    const verse = savedVerses.find(v => v.id === verseId);

    if(verse){
    document.getElementById('journalVerseReference').innerText = verse.reference;
    document.getElementById('journalVerseText').innerText = `"${verse.text}"`;
    document.getElementById('journalTextarea').value = verse.journal || '';

    document.getElementById('journalModal').style.display = 'block';
    }
}

function closeJournal(){
  document.getElementById('journalModal').style.display = 'none';
  currentlyEditingVerseId = null;
}

async function saveJournal(){
  if(currentlyEditingVerseId === null) return;

  const journalText = document.getElementById('journalTextarea').value;

  const verseIndex = savedVerses.findIndex(v => v.id === currentlyEditingVerseId);

  if(verseIndex > -1){
    savedVerses[verseIndex].journal = journalText;

    await window.electronStore.set('saved-verses', savedVerses);
    
    renderSavedVerses();
  }
  closeJournal();
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('hours').textContent = hours;
  document.getElementById('minutes').textContent = minutes;
  document.getElementById('seconds').textContent = seconds;
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const dateString = now.toLocaleDateString('en-US', options);
  document.getElementById('dateDisplay').textContent = dateString;
}

// Call the initialize function to start the app
initializeApp();