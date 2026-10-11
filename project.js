/**
 * Spotify Web Player Clone - Main JavaScript Logic
 * Handles music playback, playlist navigation, progress tracking,
 * volume control, card interactions, audio synthesis fallback, and UI synchronization.
 */

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. DATA: SONGS & PLAYLIST
    // ==========================================
    const playlist = [
        {
            title: "Top 50 - Global",
            artist: "Spotify Charts",
            image: "asserts/card1img.jpeg",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            duration: "06:12"
        },
        {
            title: "Mahiya jinna Sochna",
            artist: "Darshan Raval",
            image: "asserts/card2img.jpeg",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            duration: "07:05"
        },
        {
            title: "Mara Pass Tum Ho",
            artist: "Rahat Fateh Ali Khan",
            image: "asserts/card3img.jpeg",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            duration: "05:44"
        },
        {
            title: "LEO - Beast Mode",
            artist: "Anirudh Ravichander",
            image: "asserts/card4img.jpeg",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
            duration: "05:02"
        },
        {
            title: "Sansoon Ki Mala",
            artist: "Rahat Fateh Ali Khan",
            image: "asserts/card3img.jpeg",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
            duration: "05:53"
        },
        {
            title: "LEO - Badass",
            artist: "Thalapathy Vijay",
            image: "asserts/card4img.jpeg",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
            duration: "04:39"
        },
        {
            title: "Top Songs Global",
            artist: "Weekly Chart Updates",
            image: "asserts/card5img.jpeg",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
            duration: "05:17"
        },
        {
            title: "Top Songs India",
            artist: "Trending Across India",
            image: "asserts/card6img.jpeg",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
            duration: "04:47"
        },
        {
            title: "Top 50 - Global (Trending)",
            artist: "Daily Global Highlights",
            image: "asserts/card1img.jpeg",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
            duration: "05:28"
        }
    ];

    // ==========================================
    // 2. DOM ELEMENT REFERENCES
    // ==========================================
    const audio = document.getElementById("audio-player") || new Audio();
    const playBtn = document.getElementById("play-btn");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const shuffleBtn = document.getElementById("shuffle-btn");
    const repeatBtn = document.getElementById("repeat-btn");

    const progressBar = document.getElementById("progress-bar");
    const curTimeSpan = document.querySelector(".cur-time");
    const totTimeSpan = document.querySelector(".tot-time");

    const volumeBar = document.getElementById("volume-bar");
    const volumeIcon = document.getElementById("volume-icon");

    const albumImg = document.querySelector(".left .album");
    const songTitleElem = document.querySelector(".song-info h4");
    const songArtistElem = document.querySelector(".song-info p");
    const likeIcon = document.querySelector(".like-icon");

    const cards = document.querySelectorAll(".card");
    const toast = document.getElementById("toast");

    // ==========================================
    // 3. STATE VARIABLES
    // ==========================================
    let currentSongIndex = 1; // Default to 'Mahiya jinna Sochna'
    let isPlaying = false;
    let isShuffle = false;
    let isRepeat = false;
    let isMuted = false;
    let previousVolume = 0.7;
    let isSeeking = false;
    let synthInterval = null;
    let audioCtx = null;

    // Set initial audio volume
    audio.volume = previousVolume;
    updateSliderBackground(volumeBar, volumeBar.value);

    // ==========================================
    // 4. AUDIO SYNTHESIZER FALLBACK
    // ==========================================
    // If external audio CDN is unreachable or offline, Web Audio API provides pleasant melody
    function playSynthFallbackNote() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            // Pentatonic scale frequencies
            const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
            const freq = notes[Math.floor(Math.random() * notes.length)];

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.08 * (isMuted ? 0 : audio.volume), audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.85);
        } catch (e) {
            // Audio context not allowed or failed silently
        }
    }

    function startSynthFallback() {
        stopSynthFallback();
        synthInterval = setInterval(playSynthFallbackNote, 600);
    }

    function stopSynthFallback() {
        if (synthInterval) {
            clearInterval(synthInterval);
            synthInterval = null;
        }
    }

    // ==========================================
    // 5. HELPER FUNCTIONS
    // ==========================================
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
    }

    function showToast(message) {
        if (!toast) return;
        toast.innerText = message;
        toast.classList.add("show");
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    }

    function updateSliderBackground(slider, value) {
        if (!slider) return;
        const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.background = `linear-gradient(to right, #1ed760 0%, #1ed760 ${percentage}%, #4d4d4d ${percentage}%, #4d4d4d 100%)`;
    }

    function updatePlayPauseIcons(playing) {
        if (!playBtn) return;
        if (playing) {
            // Change play icon into pause icon
            playBtn.src = "./asserts/play_musicbar.png";
            playBtn.title = "Pause";
        } else {
            playBtn.src = "./asserts/player_icon3.png";
            playBtn.title = "Play";
        }
    }

    function highlightActiveCard() {
        cards.forEach((card, index) => {
            if (index === currentSongIndex) {
                card.classList.add("playing");
            } else {
                card.classList.remove("playing");
            }
        });
    }

    // ==========================================
    // 6. SONG LOADING & PLAYBACK LOGIC
    // ==========================================
    function loadSong(index, autoPlay = true) {
        if (index < 0 || index >= playlist.length) {
            index = 0;
        }
        currentSongIndex = index;
        const song = playlist[index];

        // Update player info
        if (songTitleElem) songTitleElem.textContent = song.title;
        if (songArtistElem) songArtistElem.textContent = song.artist;
        if (albumImg) {
            albumImg.src = song.image;
            albumImg.alt = song.title;
        }

        // Set duration display placeholder
        if (totTimeSpan) totTimeSpan.textContent = song.duration || "03:30";
        if (curTimeSpan) curTimeSpan.textContent = "00:00";
        if (progressBar) {
            progressBar.value = 0;
            updateSliderBackground(progressBar, 0);
        }

        // Set audio source
        audio.src = song.audioUrl;
        audio.load();

        highlightActiveCard();

        if (autoPlay) {
            playAudio();
        } else {
            pauseAudio();
        }
    }

    function playAudio() {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                stopSynthFallback();
                updatePlayPauseIcons(true);
            }).catch(error => {
                console.warn("Audio autoplay blocked or network issue. Engaging fallback sound:", error);
                isPlaying = true;
                startSynthFallback();
                updatePlayPauseIcons(true);
            });
        }
    }

    function pauseAudio() {
        audio.pause();
        stopSynthFallback();
        isPlaying = false;
        updatePlayPauseIcons(false);
    }

    function togglePlay() {
        if (isPlaying) {
            pauseAudio();
            showToast("Paused");
        } else {
            playAudio();
            showToast(`Playing: ${playlist[currentSongIndex].title}`);
        }
    }

    function playNextSong() {
        if (isShuffle) {
            let nextIndex = Math.floor(Math.random() * playlist.length);
            if (nextIndex === currentSongIndex) {
                nextIndex = (currentSongIndex + 1) % playlist.length;
            }
            loadSong(nextIndex, true);
        } else {
            const nextIndex = (currentSongIndex + 1) % playlist.length;
            loadSong(nextIndex, true);
        }
        showToast(`Next: ${playlist[currentSongIndex].title}`);
    }

    function playPrevSong() {
        // If current song played > 3 seconds, replay from start
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            playAudio();
            return;
        }
        const prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        loadSong(prevIndex, true);
        showToast(`Previous: ${playlist[currentSongIndex].title}`);
    }

    // ==========================================
    // 7. EVENT LISTENERS: PLAYER BUTTONS
    // ==========================================
    if (playBtn) {
        playBtn.addEventListener("click", togglePlay);
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", playNextSong);
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", playPrevSong);
    }

    // Shuffle Button
    if (shuffleBtn) {
        shuffleBtn.addEventListener("click", () => {
            isShuffle = !isShuffle;
            shuffleBtn.classList.toggle("active", isShuffle);
            showToast(isShuffle ? "Shuffle On" : "Shuffle Off");
        });
    }

    // Repeat Button
    if (repeatBtn) {
        repeatBtn.addEventListener("click", () => {
            isRepeat = !isRepeat;
            repeatBtn.classList.toggle("active", isRepeat);
            showToast(isRepeat ? "Repeat Current Song" : "Repeat Off");
        });
    }

    // Like Song Icon
    if (likeIcon) {
        likeIcon.addEventListener("click", () => {
            likeIcon.classList.toggle("fa-solid");
            likeIcon.classList.toggle("fa-regular");
            likeIcon.classList.toggle("liked");
            const isLiked = likeIcon.classList.contains("liked");
            showToast(isLiked ? "Saved to your Liked Songs" : "Removed from Liked Songs");
        });
    }

    // ==========================================
    // 8. PROGRESS BAR & TIME UPDATES
    // ==========================================
    audio.addEventListener("timeupdate", () => {
        if (!isSeeking && audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            if (progressBar) {
                progressBar.value = percent;
                updateSliderBackground(progressBar, percent);
            }
            if (curTimeSpan) curTimeSpan.textContent = formatTime(audio.currentTime);
            if (totTimeSpan) totTimeSpan.textContent = formatTime(audio.duration);
        }
    });

    audio.addEventListener("loadedmetadata", () => {
        if (totTimeSpan && audio.duration) {
            totTimeSpan.textContent = formatTime(audio.duration);
        }
    });

    audio.addEventListener("ended", () => {
        if (isRepeat) {
            audio.currentTime = 0;
            playAudio();
        } else {
            playNextSong();
        }
    });

    if (progressBar) {
        progressBar.addEventListener("input", (e) => {
            isSeeking = true;
            updateSliderBackground(progressBar, e.target.value);
            if (audio.duration) {
                const targetTime = (e.target.value / 100) * audio.duration;
                if (curTimeSpan) curTimeSpan.textContent = formatTime(targetTime);
            }
        });

        progressBar.addEventListener("change", (e) => {
            if (audio.duration) {
                audio.currentTime = (e.target.value / 100) * audio.duration;
            }
            isSeeking = false;
        });
    }

    // ==========================================
    // 9. VOLUME CONTROL
    // ==========================================
    function updateVolumeIcon(volume, muted) {
        if (!volumeIcon) return;
        if (muted || volume === 0) {
            volumeIcon.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        } else if (volume < 0.4) {
            volumeIcon.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
        } else {
            volumeIcon.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        }
    }

    if (volumeBar) {
        volumeBar.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            const volumeFraction = val / 100;
            audio.volume = volumeFraction;
            previousVolume = volumeFraction;
            isMuted = val === 0;
            updateVolumeIcon(audio.volume, isMuted);
            updateSliderBackground(volumeBar, val);
        });
    }

    if (volumeIcon) {
        volumeIcon.addEventListener("click", () => {
            if (isMuted) {
                isMuted = false;
                audio.volume = previousVolume > 0 ? previousVolume : 0.7;
                if (volumeBar) {
                    volumeBar.value = audio.volume * 100;
                    updateSliderBackground(volumeBar, volumeBar.value);
                }
                updateVolumeIcon(audio.volume, false);
                showToast("Unmuted");
            } else {
                isMuted = true;
                previousVolume = audio.volume;
                audio.volume = 0;
                if (volumeBar) {
                    volumeBar.value = 0;
                    updateSliderBackground(volumeBar, 0);
                }
                updateVolumeIcon(0, true);
                showToast("Muted");
            }
        });
    }

    // ==========================================
    // 10. CARD INTERACTIONS & HOVER PLAY BUTTONS
    // ==========================================
    cards.forEach((card, index) => {
        // Create Spotify circular play hover button
        const cardPlayBtn = document.createElement("div");
        cardPlayBtn.className = "card-play-btn";
        cardPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        cardPlayBtn.title = "Play this track";
        card.appendChild(cardPlayBtn);

        // Clicking card plays this track
        card.addEventListener("click", (e) => {
            e.stopPropagation();
            if (currentSongIndex === index && isPlaying) {
                pauseAudio();
            } else {
                loadSong(index, true);
            }
        });
    });

    // ==========================================
    // 11. SIDEBAR & NAVIGATION INTERACTIONS
    // ==========================================
    // "Create playlist" button
    const createPlaylistBtn = document.querySelectorAll(".badge")[0];
    if (createPlaylistBtn && createPlaylistBtn.textContent.includes("Create playlist")) {
        createPlaylistBtn.addEventListener("click", () => {
            const playlistName = prompt("Enter a name for your new playlist:", "My Playlist #" + (document.querySelectorAll(".custom-playlist").length + 1));
            if (playlistName && playlistName.trim() !== "") {
                const libBox = document.querySelector(".lib-box");
                if (libBox) {
                    const newBox = document.createElement("div");
                    newBox.className = "box custom-playlist";
                    newBox.innerHTML = `
                        <p class="box-p1">${playlistName.trim()}</p>
                        <p class="box-p2">Playlist • Made by You</p>
                        <button class="badge" style="background-color:#1ed760;color:#000;">Play</button>
                    `;
                    newBox.querySelector("button").addEventListener("click", () => {
                        loadSong(0, true);
                        showToast(`Playing playlist: ${playlistName.trim()}`);
                    });
                    libBox.appendChild(newBox);
                    showToast(`Created playlist "${playlistName.trim()}"`);
                }
            }
        });
    }

    // "Browse podcasts" button
    const browsePodcastBtn = document.querySelectorAll(".badge")[1];
    if (browsePodcastBtn && browsePodcastBtn.textContent.includes("Browse podcasts")) {
        browsePodcastBtn.addEventListener("click", () => {
            showToast("Opening Podcast Directory...");
        });
    }

    // "Install App" button
    const installAppBtn = document.querySelector(".dark-badge");
    if (installAppBtn) {
        installAppBtn.addEventListener("click", () => {
            showToast("Desktop App ready to install!");
        });
    }

    // "Explore Premium" button
    const premiumBtn = document.querySelector(".sticky-nav-options .badge");
    if (premiumBtn && !premiumBtn.classList.contains("dark-badge")) {
        premiumBtn.addEventListener("click", () => {
            showToast("Spotify Premium: 3 months free trial!");
        });
    }

    // Search Nav Option (Search filter)
    const searchNavOption = document.querySelectorAll(".nav-option")[1];
    if (searchNavOption) {
        searchNavOption.style.cursor = "pointer";
        searchNavOption.addEventListener("click", () => {
            const query = prompt("Search for songs, artists, or charts:", "");
            if (query !== null) {
                const lower = query.toLowerCase().trim();
                let foundMatch = false;
                cards.forEach((card, idx) => {
                    const title = (playlist[idx] ? playlist[idx].title : "").toLowerCase();
                    const artist = (playlist[idx] ? playlist[idx].artist : "").toLowerCase();
                    if (!lower || title.includes(lower) || artist.includes(lower)) {
                        card.style.display = "block";
                        foundMatch = true;
                    } else {
                        card.style.display = "none";
                    }
                });
                if (lower) {
                    showToast(foundMatch ? `Filtered songs for "${query}"` : `No matches for "${query}"`);
                } else {
                    showToast("Showing all tracks");
                }
            }
        });
    }

    // Home Nav Option (Reset view)
    const homeNavOption = document.querySelectorAll(".nav-option")[0];
    if (homeNavOption) {
        homeNavOption.style.cursor = "pointer";
        homeNavOption.addEventListener("click", () => {
            cards.forEach(card => card.style.display = "block");
            showToast("Home view loaded");
        });
    }

    // Sticky nav backward & forward icons
    const backNavIcon = document.querySelector(".sticky-nav-icons img:nth-child(1)");
    const forwardNavIcon = document.querySelector(".sticky-nav-icons img:nth-child(2)");
    if (backNavIcon) {
        backNavIcon.style.cursor = "pointer";
        backNavIcon.addEventListener("click", () => {
            playPrevSong();
        });
    }
    if (forwardNavIcon) {
        forwardNavIcon.style.cursor = "pointer";
        forwardNavIcon.addEventListener("click", () => {
            playNextSong();
        });
    }

    // ==========================================
    // 12. KEYBOARD CONTROLS SHORTCUTS
    // ==========================================
    document.addEventListener("keydown", (e) => {
        // Prevent interfering when typing in an input
        if (e.target.tagName === "INPUT" && e.target.type === "text") return;

        switch (e.code) {
            case "Space":
                e.preventDefault();
                togglePlay();
                break;
            case "ArrowRight":
                e.preventDefault();
                if (audio.duration) {
                    audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
                    showToast("+5s Seek");
                }
                break;
            case "ArrowLeft":
                e.preventDefault();
                if (audio.duration) {
                    audio.currentTime = Math.max(audio.currentTime - 5, 0);
                    showToast("-5s Seek");
                }
                break;
            case "ArrowUp":
                e.preventDefault();
                audio.volume = Math.min(1, audio.volume + 0.05);
                if (volumeBar) {
                    volumeBar.value = audio.volume * 100;
                    updateSliderBackground(volumeBar, volumeBar.value);
                }
                updateVolumeIcon(audio.volume, false);
                break;
            case "ArrowDown":
                e.preventDefault();
                audio.volume = Math.max(0, audio.volume - 0.05);
                if (volumeBar) {
                    volumeBar.value = audio.volume * 100;
                    updateSliderBackground(volumeBar, volumeBar.value);
                }
                updateVolumeIcon(audio.volume, audio.volume === 0);
                break;
            case "KeyM":
                if (volumeIcon) volumeIcon.click();
                break;
            case "KeyN":
                playNextSong();
                break;
            case "KeyP":
                playPrevSong();
                break;
            default:
                break;
        }
    });

    // ==========================================
    // 13. INITIALIZE DEFAULT SONG
    // ==========================================
    loadSong(currentSongIndex, false);
    showToast("Ready! Click any song or press Space to play");
});
