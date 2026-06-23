let currentAudio = new Audio();
let songs = [];
let currentIndex = 0;

// DOM Elements
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const seekbar = document.getElementById('seekbar');
const progressCircle = document.getElementById('progress-circle');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const trackList = document.getElementById('track-list');
const themeToggle = document.getElementById('theme-toggle');

// Theme Toggle Logic
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('aura_theme', isLight ? 'light' : 'dark');
});

if (localStorage.getItem('aura_theme') === 'light') {
    document.body.classList.add('light-theme');
}

// Utility: Format Time
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Fetch Songs from API
async function loadSongs() {
    try {
        const response = await fetch('/api/songs');
        songs = await response.json();
        
        if(songs.length === 0) {
            trackList.innerHTML = "<p>Database is empty. Go to /api/seed in your browser to add tests.</p>";
            return;
        }

        renderPlaylist();
        loadAudio(songs[0]); // Load first song by default
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

// Render Playlist UI
function renderPlaylist() {
    trackList.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.className = 'track-item';
        li.innerHTML = `
            <img src="${song.coverUrl}" alt="cover" style="width: 40px; height: 40px; border-radius: 8px;">
            <div class="track-info">
                <h4>${song.title}</h4>
                <p style="font-size: 0.8rem; opacity: 0.7;">${song.artist}</p>
            </div>
        `;
        li.addEventListener('click', () => {
            currentIndex = index;
            playAudio(song);
        });
        trackList.appendChild(li);
    });
}

// Load Audio without playing
function loadAudio(song) {
    currentAudio.src = song.cloudUrl;
    document.getElementById('active-title').innerText = song.title;
    document.getElementById('active-artist').innerText = song.artist;
    document.getElementById('active-cover').src = song.coverUrl;
    playBtn.innerText = "▶";
}

// Play Audio
function playAudio(song) {
    loadAudio(song);
    currentAudio.play();
    playBtn.innerText = "⏸";
}

// Play/Pause Button Logic
playBtn.addEventListener('click', () => {
    if (currentAudio.src === "") return;
    if (currentAudio.paused) {
        currentAudio.play();
        playBtn.innerText = "⏸";
    } else {
        currentAudio.pause();
        playBtn.innerText = "▶";
    }
});

// Next and Previous Logic
nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % songs.length;
    playAudio(songs[currentIndex]);
});

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    playAudio(songs[currentIndex]);
});

// Time Update Logic for Seekbar
currentAudio.addEventListener('timeupdate', () => {
    currentTimeEl.innerText = formatTime(currentAudio.currentTime);
    totalTimeEl.innerText = formatTime(currentAudio.duration);
    
    if(currentAudio.duration) {
        const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
        progressCircle.style.left = `${percent}%`;
    }
});

// Seekbar Click Logic
seekbar.addEventListener('click', (e) => {
    const rect = seekbar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    currentAudio.currentTime = percent * currentAudio.duration;
});

// Auto-play next song
currentAudio.addEventListener('ended', () => {
    nextBtn.click();
});

// Initialize
loadSongs();