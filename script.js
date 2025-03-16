document.addEventListener("DOMContentLoaded", function () {
  const playlistItems = document.querySelectorAll("#playlist li");
  const audioPlayer = document.getElementById("audioPlayer");
  const coverArt = document.getElementById("coverArt");
  const songTitle = document.getElementById("songTitle");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  let currentIndex = 0;
  const fallbackImage = "fallback.jpg";

  // Load the specified track, update UI and start playback
  function loadTrack(index) {
    if (index < 0 || index >= playlistItems.length) return;

    // Remove active class from all items and add to current track
    playlistItems.forEach((item) => item.classList.remove("active"));
    playlistItems[index].classList.add("active");

    // Update song title using the text content of the selected playlist item
    songTitle.textContent = playlistItems[index].textContent.trim();

    // Get the song file URL and set the audio source
    const fileUrl = playlistItems[index].getAttribute("data-src");
    audioPlayer.src = fileUrl;

    // Load cover art from embedded tags
    loadCoverArt(fileUrl);

    // Start playback immediately (this is a user-initiated action)
    audioPlayer
      .play()
      .then(() => {
        console.log("Playback started for track:", index);
      })
      .catch((err) => {
        console.error("Playback failed:", err);
      });
  }

  // Extract cover art from MP3 using jsmediatags; fall back if unavailable
  function loadCoverArt(fileUrl) {
    coverArt.src = fallbackImage;
    jsmediatags.read(fileUrl, {
      onSuccess: function (tag) {
        if (tag.tags.picture) {
          const picture = tag.tags.picture;
          const base64String = arrayBufferToBase64(picture.data);
          coverArt.src = `data:${picture.format};base64,${base64String}`;
        }
      },
      onError: function (error) {
        console.warn("Error reading tags:", error);
      },
    });
  }

  // Helper function to convert an array buffer to a base64 string
  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Attach click and double-click events to each playlist item so that clicking a song starts playback immediately
  playlistItems.forEach((item, index) => {
    item.addEventListener("click", function () {
      currentIndex = index;
      loadTrack(currentIndex);
    });
    item.addEventListener("dblclick", function () {
      currentIndex = index;
      loadTrack(currentIndex);
    });
  });

  // Next button event listener
  nextBtn.addEventListener("click", function () {
    currentIndex = (currentIndex + 1) % playlistItems.length;
    loadTrack(currentIndex);
  });

  // Previous button event listener
  prevBtn.addEventListener("click", function () {
    currentIndex =
      (currentIndex - 1 + playlistItems.length) % playlistItems.length;
    loadTrack(currentIndex);
  });

  // Auto-play next track when current track ends
  audioPlayer.addEventListener("ended", function () {
    currentIndex = (currentIndex + 1) % playlistItems.length;
    loadTrack(currentIndex);
  });

  // Uncomment the following line if you want to start playback immediately on page load:
  loadTrack(currentIndex);
});
