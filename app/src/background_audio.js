const ORIGINAL_TRANSLATIONS = [
  "original", // English
  "оригинал", // Russian
  "オリジナル", // Japanese
  "原始", // Chinese
  "원본", // Korean
  "origineel", // Dutch
  "original", // Spanish/Portuguese
  "originale", // Italian/French
  "original", // German
  "oryginał", // Polish
  "původní", // Czech
  "αρχικό", // Greek
  "orijinal", // Turkish
  "原創", // Traditional Chinese
  "gốc", // Vietnamese
  "asli", // Indonesian
  "מקורי", // Hebrew
  "أصلي", // Arabic
];

let mutationIdx = 0;
const MUTATION_UPDATE_STEP = 2;

function getOriginalTrack(tracks) {
  if (!tracks || !Array.isArray(tracks)) {
    return null;
  }

  let languageFieldName = null;
  for (const track of tracks) {
    if (!track || typeof track !== "object") continue;

    for (const [fieldName, field] of Object.entries(track)) {
      if (field && typeof field === "object" && field.name) {
        languageFieldName = fieldName;
        break;
      }
    }
    if (languageFieldName) break;
  }

  if (!languageFieldName) {
    return;
  }

  for (const track of tracks) {
    if (!track || !track[languageFieldName] || !track[languageFieldName].name)
      continue;

    const trackName = track[languageFieldName].name.toLowerCase();
    for (const originalWord of ORIGINAL_TRANSLATIONS) {
      if (trackName.includes(originalWord.toLowerCase())) {
        return track;
      }
    }
  }
}

async function untranslateAudioTrack() {
  const player = window.YoutubeAntiTranslate.getFirstVisible(document.querySelectorAll(window.YoutubeAntiTranslate.getPlayerSelector()));
  if (!player || !player.getAvailableAudioTracks() || player.audioUntranslated) {
    return;
  }

  const tracks = player.getAvailableAudioTracks();

  const originalTrack = getOriginalTrack(tracks);

  if (originalTrack) {
    let temp = await player.setAudioTrack(originalTrack);
    if (temp) {
      player.audioUntranslated = true;
    }
  }
}

async function untranslate() {
  if (mutationIdx % MUTATION_UPDATE_STEP == 0) {
    await untranslateAudioTrack();
  }
  mutationIdx++;
}

// Initialize the extension
const target = document.body;
const config = { childList: true, subtree: true };
const observer = new MutationObserver(untranslate);
observer.observe(target, config);
