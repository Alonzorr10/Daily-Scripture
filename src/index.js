    async function loadBibleData() {
    const response = await fetch('data/en_kjv.json');
    return response.json();
    }

    let savedVerses = [];
    let currentVerse = null;

    function getRandomVerse(bibleData) {
    // bibleData is an array of book objects
    const bookIndex = Math.floor(Math.random() * bibleData.length);
    const book = bibleData[bookIndex];

    // Get all chapter numbers (keys are strings)
    const chapters = Object.keys(book.chapters);
    const chapterIndex = Math.floor(Math.random() * chapters.length);
    const chapterNum = chapters[chapterIndex];

    const verses = Object.keys(book.chapters[chapterNum]);
    const verseIndex = Math.floor(Math.random() * verses.length);
    const verseNum = verses[verseIndex];

    const text = book.chapters[chapterNum][verseNum];
    return {
        bookName: book.name,
        chapter: chapterNum,
        verse: verseNum,
        text: text
    };
    }
    document.getElementById('generateVerse').addEventListener('click', async () => {
    try
    {
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
        const isSaved = savedVerses.some(saved => saved.reference === currentVerse.reference);

        if(isSaved){
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
  
  // Update UI
  updateSavedCount();
  showNotification('Verse saved successfully! ✨');
  document.getElementById('saveVerse').disabled = true;
});

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

document.getElementById('clearAll').addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all saved verses? This action cannot be undone.')) {
    savedVerses = [];
    updateSavedCount();
    renderSavedVerses();
    console.log('All verses cleared');
  }
});


//Helper stuff
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


        // Clock functionality
        function updateClock() {
            const now = new Date();
            
            // Update time
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            document.getElementById('hours').textContent = hours;
            document.getElementById('minutes').textContent = minutes;
            document.getElementById('seconds').textContent = seconds;
            
            // Update date
            const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
            };
            const dateString = now.toLocaleDateString('en-US', options);
            document.getElementById('dateDisplay').textContent = dateString;

            if (dateString.options.weekday === "Sunday")
            {
                document.getElementById('Sunday').display = 'block';
            } 
        }

        // Initialize clock
        updateClock();
        setInterval(updateClock, 1000);