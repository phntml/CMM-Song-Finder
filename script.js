document.addEventListener('DOMContentLoaded', () => {
    let allSongs = [];
    const resultsContainer = document.getElementById('results');
    const searchInput = document.getElementById('search');
    const albumFilter = document.getElementById('album-filter');
    const artistFilter = document.getElementById('artist-filter');
    const genreFilter = document.getElementById('genre-filter');
    const songCount = document.getElementById('count');
    const totalCount = document.getElementById('total-count');
    const modal = document.getElementById('songModal');
    const modalContent = document.getElementById('modal-content');
    const closeBtn = document.querySelector('.close');
    
    // Close modal
    closeBtn.onclick = () => modal.classList.remove('show');
    window.onclick = (e) => e.target === modal && modal.classList.remove('show');
    
    // Load song data
    fetch('music_data.json')
        .then(response => response.json())
        .then(data => {
            allSongs = data;
            songCount.textContent = allSongs.length;
            totalCount.textContent = allSongs.length;
            renderSongs(allSongs);
            initFilters();
        })
        .catch(error => {
            console.error('Error loading JSON:', error);
            resultsContainer.innerHTML = `
                <div class="empty">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error loading song data</h3>
                    <p>Please check if music_data.json exists</p>
                </div>
            `;
        });
    
    // Initialize search and filters
    searchInput.addEventListener('input', filterSongs);
    albumFilter.addEventListener('change', filterSongs);
    artistFilter.addEventListener('change', filterSongs);
    genreFilter.addEventListener('change', filterSongs);
    
    function filterSongs() {
        const searchTerm = searchInput.value.toLowerCase();
        const albumValue = albumFilter.value;
        const artistValue = artistFilter.value;
        const genreValue = genreFilter.value;
        
        const filtered = allSongs.filter(song => {
            const matchesSearch = song.title.toLowerCase().includes(searchTerm) || 
                                 song.artist.toLowerCase().includes(searchTerm) ||
                                 song.album.toLowerCase().includes(searchTerm) ||
                                 (song.genre && song.genre.toLowerCase().includes(searchTerm));
            const matchesAlbum = albumValue ? song.album === albumValue : true;
            const matchesArtist = artistValue ? song.artist === artistValue : true;
            const matchesGenre = genreValue ? (song.genre && song.genre.includes(genreValue)) : true;
            
            return matchesSearch && matchesAlbum && matchesArtist && matchesGenre;
        });
        
        songCount.textContent = filtered.length;
        renderSongs(filtered);
    }
    
    function renderSongs(songs) {
        resultsContainer.innerHTML = '';
        
        if (songs.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty">
                    <i class="fas fa-search"></i>
                    <h3>No songs found</h3>
                    <p>Try different search terms or filters</p>
                </div>
            `;
            return;
        }
        
        songs.forEach(song => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="cover-container">
                    ${song.cover_b64 ? 
                        `<img src="data:image/jpeg;base64,${song.cover_b64}" alt="${song.album}" class="cover">` : 
                        `<div class="cover-placeholder"><i class="fas fa-compact-disc"></i></div>`
                    }
                </div>
                <div class="card-content">
                    <h3 class="line-clamp line-clamp-1">${song.title}</h3>
                    <p class="artist line-clamp line-clamp-1"><i class="fas fa-user"></i> ${song.artist}</p>
                    <p class="album line-clamp line-clamp-1"><i class="fas fa-record-vinyl"></i> ${song.album}</p>
                    ${song.genre ? `<p class="line-clamp line-clamp-1"><i class="fas fa-music"></i> ${song.genre}</p>` : ''}
                </div>
            `;
            
            card.addEventListener('click', () => showSongDetails(song));
            resultsContainer.appendChild(card);
        });
    }
    
    function showSongDetails(song) {
        modalContent.innerHTML = `
            <div class="song-header">
                ${song.cover_b64 ? 
                    `<img src="data:image/jpeg;base64,${song.cover_b64}" alt="${song.album}" class="song-cover">` : 
                    `<div class="placeholder-cover"><i class="fas fa-compact-disc"></i></div>`
                }
                <div class="song-info">
                    <h2 class="line-clamp line-clamp-2">${song.title}</h2>
                    <div class="song-meta">
                        <p><strong>Artist:</strong> <span class="line-clamp line-clamp-1">${song.artist}</span></p>
                        <p><strong>Album:</strong> <span class="line-clamp line-clamp-1">${song.album}</span></p>
                        ${song.genre ? `<p><strong>Genre:</strong> <span class="line-clamp line-clamp-1">${song.genre}</span></p>` : ''}
                        ${song.year ? `<p><strong>Year:</strong> ${song.year}</p>` : ''}
                        ${song.track ? `<p><strong>Track:</strong> ${song.track}</p>` : ''}
                        <p><strong>File Path:</strong> <span class="line-clamp line-clamp-1">${song.file_path}</span></p>
                    </div>
                </div>
            </div>
            <div class="audio-preview">
                <h3><i class="fas fa-play-circle"></i> Preview</h3>
                <audio controls class="audio-player">
                    <source src="${song.file_path}" type="audio/mpeg">
                    Your browser does not support audio playback.
                </audio>
                <p class="note">Note: Audio preview requires files to be hosted online</p>
            </div>
        `;
        modal.classList.add('show');
    }
    
    function initFilters() {
        // Get unique values
        const albums = [...new Set(allSongs.map(s => s.album))].sort();
        const artists = [...new Set(allSongs.map(s => s.artist))].sort();
        const genres = [...new Set(allSongs.flatMap(s => s.genre ? [s.genre] : []))].sort();
        
        // Populate album filter
        albums.forEach(album => {
            const option = document.createElement('option');
            option.value = album;
            option.textContent = album;
            albumFilter.appendChild(option);
        });
        
        // Populate artist filter
        artists.forEach(artist => {
            const option = document.createElement('option');
            option.value = artist;
            option.textContent = artist;
            artistFilter.appendChild(option);
        });
        
        // Populate genre filter
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
    }
});