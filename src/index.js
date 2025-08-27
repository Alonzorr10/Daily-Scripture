async function loadBibleData() {
  const response = await fetch('data/en_kjv.json');
  return response.json();
}

let savedVerses = [];
let currentVerse = null;

// --- FIXED VERSION ---
function getRandomVerse(bibleData) {
  // Pick a random book
  const bookIndex = Math.floor(Math.random() * bibleData.length);
  const book = bibleData[bookIndex];
  const chapters = book.chapters;

  // --- Handle chapters (array or object) ---
  let chapterData, chapterNum;
  if (Array.isArray(chapters)) {
    // Chapters stored as an array (0-based)
    const cIdx = Math.floor(Math.random() * chapters.length);
    chapterData = chapters[cIdx];
    chapterNum = cIdx + 1; // convert to 1-based
  } else {
    // Chapters stored as object with keys "1","2","3",...
    const cKeys = Object.keys(chapters).map(Number).sort((a, b) => a - b);
    const cIdx = Math.floor(Math.random() * cKeys.length);
    chapterNum = cKeys[cIdx]; // already 1-based
    chapterData = chapters[String(chapterNum)];
  }

  // --- Handle verses (array or object) ---
  let verseText, verseNum;
  if (Array.isArray(chapterData)) {
    const vIdx = Math.floor(Math.random() * chapterData.length);
    verseText = chapterData[vIdx];
    verseNum = vIdx + 1; // convert to 1-based
  } else {
    const vKeys = Object.keys(chapterData).map(Number).sort((a, b) => a - b);
    const vIdx = Math.floor(Math.random() * vKeys.length);
    verseNum = vKeys[vIdx]; // already 1-based
    verseText = chapterData[String(verseNum)];
  }

  return {
    bookName: book.name,
    chapter: chapterNum,
    verse: verseNum,
    text: verseText
  };
}

// --- Event: Generate Verse ---
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

    console.log("DEBUG → Generated Verse:", currentVerse.reference, currentVerse.text.slice(0,60));
  } catch (err) {
    document.getElementById('verseDisplay').innerText = 'Error loading verse: ' + err.message;
    console.error(err);
  }
});

// --- Event: Save Verse ---
document.getElementById('saveVerse').addEventListener('click', async () => {
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
  console.log('Verse saved! Total saved:', savedVerses.length);

  updateSavedCount();
  showNotification('Verse saved successfully! ✨');
  document.getElementById('saveVerse').disabled = true;
});

// --- Event: View Saved Verses ---
document.getElementById('savedVerse').addEventListener('click', async () => {
  const mainContent = document.getElementById('mainContent');
  const savedPage = document.getElementById('savedPage');

  if (mainContent && savedPage) {
    mainContent.style.display = 'none';
    savedPage.style.display = 'block';
    savedPage.classList.add('active');
    renderSavedVerses();
    console.log('Switched to saved verses page');
  } else {
    console.error('Could not find page elements');
    alert('Error switching to saved verses page');
  }
});

// --- Event: Back to Main ---
document.getElementById('backToMain').addEventListener('click', () => {
  const mainContent = document.getElementById('mainContent');
  const savedPage = document.getElementById('savedPage');

  if (mainContent && savedPage) {
    mainContent.style.display = 'block';
    savedPage.style.display = 'none';
    savedPage.classList.remove('active');
    console.log('Switched back to main page');
  }
});

// --- Event: Clear Saved Verses ---
document.getElementById('clearAll').addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all saved verses? This action cannot be undone.')) {
    savedVerses = [];
    updateSavedCount();
    renderSavedVerses();
    console.log('All verses cleared');
  }
});

// --- Helpers ---
function updateSavedCount() {
  const countElement = document.getElementById('savedCount');
  if (countElement) {
    countElement.textContent = savedVerses.length;
  }
}

function showNotification(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
}

function renderSavedVerses() {
  const container = document.getElementById('savedVersesList');
  if (!container) return;

  if (savedVerses.length === 0) {
    container.innerHTML = '<div class="no-verses">No saved verses yet. Generate and save some scriptures to see them here!</div>';
    return;
  }

  container.innerHTML = savedVerses.map(verse => `
    <div class="saved-verse-item">
      <button class="delete-btn" onclick="deleteVerse(${verse.id})">×</button>
      <div class="saved-verse-text">"${verse.text}"</div>
      <div class="saved-verse-reference">- ${verse.reference}</div>
      <div class="saved-verse-date">Saved on ${verse.dateSaved}</div>
    </div>
  `).join('');
}

function deleteVerse(verseId) {
  savedVerses = savedVerses.filter(verse => verse.id !== verseId);
  updateSavedCount();
  renderSavedVerses();
  console.log('Verse deleted, remaining:', savedVerses.length);
}

// --- Clock functionality ---
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

  if (dateString.options?.weekday === "Sunday") {
    document.getElementById('Sunday').display = 'block';
  } 
}

// Initialize clock
updateClock();
setInterval(updateClock, 1000);
