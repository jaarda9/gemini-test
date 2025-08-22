// Helper functions for Gemini TTS
const base64ToArrayBuffer = (base64) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const pcmToWav = (pcm, sampleRate) => {
  const wavData = new Int16Array(pcm);
  const buffer = new ArrayBuffer(44 + wavData.byteLength);
  const view = new DataView(buffer);
  let offset = 0;

  // Write WAV header
  writeString(view, offset, 'RIFF'); offset += 4;
  view.setUint32(offset, 36 + wavData.byteLength, true); offset += 4;
  writeString(view, offset, 'WAVE'); offset += 4;
  writeString(view, offset, 'fmt '); offset += 4;
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * 2, true); offset += 4;
  view.setUint16(offset, 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;
  writeString(view, offset, 'data'); offset += 4;
  view.setUint32(offset, wavData.byteLength, true); offset += 4;

  const pcmBytes = new Uint8Array(buffer, offset);
  pcmBytes.set(new Uint8Array(wavData.buffer));

  return new Blob([buffer], { type: 'audio/wav' });
};

const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Database sync functions
async function syncToDatabase() {
  try {
    const localStorageData = JSON.parse(localStorage.getItem("gameData"));
    if (!localStorageData || Object.keys(localStorageData).length === 0) {
      console.log('No localStorage data to sync');
      return { success: true, message: 'No data to sync' };
    }

    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'your-user-id', // TODO: You'll need to generate a real user ID here
        localStorageData: localStorageData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Sync successful:', result);
    return result;

  } catch (error) {
    console.error('Error syncing to database:', error);
    throw error;
  }
}

async function loadDataFromMongoDB() {
  const userId = 'your-user-id'; // TODO: Get the user ID from your auth system
  const apiUrl = `/api/sync?userId=${userId}`;

  try {
    const response = await fetch(apiUrl, { method: 'GET' });

    if (response.status === 404) {
      console.log("Device data not found. Starting fresh.");
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const localStorageData = data.localStorageData;
    
    if (localStorageData) {
      localStorage.setItem("gameData", JSON.stringify(localStorageData));
      console.log('Data loaded successfully.');
    }

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Function to make a fetch call with exponential backoff
const fetchWithBackoff = async (url, options, retries = 5, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
        continue;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
  throw new Error('Max retries exceeded');
};

// Function to generate a new quest using the Gemini API
const generateNewQuest = async () => {
  const generateButton = document.getElementById('generate-quest-btn');
  const questStatus = document.getElementById('gemini-status');
  const generatedQuestContainer = document.getElementById('generated-quest');
  const newQuestTitle = document.getElementById('new-quest-title');
  const newQuestDescription = document.getElementById('new-quest-description');
  const ttsButton = document.getElementById('tts-btn');

  questStatus.innerHTML = '<div class="loader"></div>';
  generateButton.disabled = true;
  ttsButton.disabled = true;

  const level = document.getElementById('lvlValue').textContent;
  const str = document.getElementById('str').textContent.replace('STR: ', '');
  const agi = document.getElementById('agi').textContent.replace('AGI: ', '');
  const int = document.getElementById('int').textContent.replace('INT: ', '');
  const vit = document.getElementById('vit').textContent.replace('VIT: ', '');
  const per = document.getElementById('per').textContent.replace('PER: ', '');
  const wis = document.getElementById('wis').textContent.replace('WIS: ', '');
  const rank = document.getElementById('rank-text').textContent;
  const race = document.getElementById('race-text').textContent;
  const guild = document.getElementById('guild-text').textContent;

  const prompt = `Generate a quest for a fantasy RPG character. The character is a ${rank} rank ${race} from the ${guild} guild. Their stats are: STR:${str}, AGI:${agi}, INT:${int}, VIT:${vit}, PER:${per}, WIS:${wis}. The quest should be appropriate for a level ${level} character. Provide a creative quest title and a short, single-sentence description. Format the output as JSON.`;

  let chatHistory = [];
  chatHistory.push({ role: "user", parts: [{ text: prompt }] });
  
  const payload = {
    contents: chatHistory,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          "quest_title": { "type": "STRING" },
          "quest_description": { "type": "STRING" }
        },
        "propertyOrdering": ["quest_title", "quest_description"]
      }
    }
  };

  const apiKey = "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  try {
    const response = await fetchWithBackoff(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    
    const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) throw new Error('Invalid response structure from API');

    const questData = JSON.parse(jsonText);

    newQuestTitle.textContent = questData.quest_title;
    newQuestDescription.textContent = questData.quest_description;
    
    // Store the quest text to be used by the TTS function
    document.getElementById('generated-quest').dataset.questText = questData.quest_description;

    generatedQuestContainer.style.display = 'block';
    questStatus.textContent = '';
    ttsButton.disabled = false;

  } catch (error) {
    console.error('Error generating quest:', error);
    questStatus.textContent = 'Error generating quest. Please try again.';
  } finally {
    generateButton.disabled = false;
  }
};

// Function to play text-to-speech for the quest description
const playQuestAudio = async () => {
  const ttsButton = document.getElementById('tts-btn');
  const questText = document.getElementById('generated-quest').dataset.questText;

  if (!questText) {
    return;
  }

  ttsButton.disabled = true;
  const originalIcon = ttsButton.innerHTML;
  ttsButton.innerHTML = '<div class="loader"></div>';

  const payload = {
    contents: [{
      parts: [{ text: questText }]
    }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Kore" }
        }
      }
    },
    model: "gemini-2.5-flash-preview-tts"
  };
  const apiKey = "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

  try {
    const response = await fetchWithBackoff(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    
    const part = result?.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType;

    if (audioData && mimeType && mimeType.startsWith("audio/")) {
      const sampleRateMatch = mimeType.match(/rate=(\d+)/);
      const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 16000;
      const pcmData = base64ToArrayBuffer(audioData);
      const pcm16 = new Int16Array(pcmData);
      const wavBlob = pcmToWav(pcm16, sampleRate);
      const audioUrl = URL.createObjectURL(wavBlob);
      
      const audio = new Audio(audioUrl);
      audio.play();

      audio.onended = () => {
        ttsButton.disabled = false;
        ttsButton.innerHTML = originalIcon;
      };
    } else {
      throw new Error('Invalid audio response from API');
    }
  } catch (error) {
    console.error('Error playing audio:', error);
    ttsButton.disabled = false;
    ttsButton.innerHTML = originalIcon;
  }
};

// Main event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  // Call the function to load data from MongoDB on page load
  loadDataFromMongoDB();
  
  // Event listeners for new Gemini features
  document.getElementById('generate-quest-btn').addEventListener('click', generateNewQuest);
  document.getElementById('tts-btn').addEventListener('click', playQuestAudio);

  // Optional: Sync data to MongoDB before the user leaves the page
  window.addEventListener('beforeunload', syncToDatabase);
});
