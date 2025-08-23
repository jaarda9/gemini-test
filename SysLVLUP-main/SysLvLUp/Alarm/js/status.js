document.addEventListener("DOMContentLoaded", function() {
  const savedData = JSON.parse(localStorage.getItem("gameData"));
  function measurePing(url) {
      const startTime = Date.now();
      fetch(url)
          .then(response => {
              const endTime = Date.now();
              const ping = endTime - startTime; // Calculate ping
              console.log(`Ping: ${ping} ms`);
              
              // Update your UI with the ping value
              document.getElementById("ping-text").textContent = ping + " ms";
              
              // Update the ping input field and make it readonly
              const pingInput = document.getElementById("ping-input");
              pingInput.value = ping; // Set the value of the input field
              pingInput.readOnly = true; // Make the input field readonly
          });
  }

  // Call the measurePing function with a URL to ping
  measurePing('https://sys-lvlup.vercel.app/status.html'); // Replace with your server URL
});

// Constants
const ranks = ["E-Rank", "D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank"];

// Increment Button Functionality
document.querySelectorAll(".increment-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const stat = button.previousElementSibling;
    let currentValue = parseInt(stat.textContent.split(": ")[1]);
    let abilityPoints = parseInt(
      document.querySelector(".attributes div:last-child span")
        .textContent.split(": ")[1]
    );

    if (abilityPoints > 0) {
      // Increment the stat by 1
      stat.textContent = `${stat.textContent.split(": ")[0]}: ${currentValue + 1}`;
      // Decrease ability points by 1
      document.querySelector(".attributes div:last-child span").textContent = `Ability Points: ${abilityPoints - 1}`;
    }
  });
});

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

  const prompt = `Generate a quest for a RPG character that require real life tasks for self-improvement conditionned to the Player. The character is a ${rank} rank ${race} from the ${guild} guild. Their stats are: STR:${str}, AGI:${agi}, INT:${int}, VIT:${vit}, PER:${per}, WIS:${wis}. The quest should be appropriate for a level ${level} character. Provide a creative quest title and a short, single-sentence description.The Quest Should be either mental (like reading or anything like that) or physical (Running or something like that). Format the output as JSON.`;

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

  const apiKey = "AIzaSyCd8keOdeW1lZ-3CsEuVbelGeDpxE298O4";
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
  const apiKey = "AIzaSyCd8keOdeW1lZ-3CsEuVbelGeDpxE298O4";
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
  
  // Load existing game data
  loadData();
  updateFatigueProgress();
  checkForLevelUp();
  checkForNewDay();

  // Event listeners for new Gemini features - ensure elements exist first
  const generateQuestBtn = document.getElementById('generate-quest-btn');
  const ttsBtn = document.getElementById('tts-btn');
  
  if (generateQuestBtn) {
    generateQuestBtn.addEventListener('click', generateNewQuest);
  } else {
    console.error('Generate quest button not found');
  }
  
  if (ttsBtn) {
    ttsBtn.addEventListener('click', playQuestAudio);
  }

  // Optional: Sync data to MongoDB before the user leaves the page
  window.addEventListener('beforeunload', syncToDatabase);
});

function customRound(num) {
    return (num - Math.floor(num)) > 0.4 ? Math.ceil(num) : Math.floor(num);
  }
  
  let num1 = 2.4;
  console.log(customRound(num1));  // Output: 3
  
  let num2 = 2.3;
  console.log(customRound(num2));  // Output: 2
  

// Update Fatigue Progress
function updateFatigueProgress() {
  const fatigueText = document.querySelector(".fatigue-value").textContent;
  const value = parseInt(fatigueText, 10);
  const circle = document.querySelector(".progress-ring__circle");
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = offset;
}

// Update Fatigue Function
function updateFatigue(newFatigueValue) {
  document.querySelector(".fatigue-value").textContent = newFatigueValue;
  updateFatigueProgress();
}

// Toggle Edit Mode
function toggleEditMode() {
  const inputs = document.querySelectorAll(".detail-input");
  const texts = document.querySelectorAll(".detail-text");
  const saveButton = document.getElementById("save-changes");
  const editButton = document.getElementById("edit-toggle");

  inputs.forEach(input => (input.style.display = input.style.display === "none" ? "inline" : "none"));
  texts.forEach(text => (text.style.display = text.style.display === "none" ? "inline" : "none"));
  saveButton.style.display = saveButton.style.display === "none" ? "inline" : "none";
  editButton.style.display = "none"; // Hide the Edit button again after editing
}

// Handle Detail Text Click
document.querySelectorAll(".detail-text").forEach((textElement) => {
  textElement.addEventListener("click", () => {
    const input = textElement.nextElementSibling;
    textElement.style.display = "none";
    input.style.display = "inline";
    input.value = textElement.textContent.trim();
    input.focus();
  });
});

// Handle Detail Input Blur and Keypress
document.querySelectorAll(".detail-input").forEach((input) => {
  input.addEventListener("blur", () => saveInputValue(input));
  input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveInputValue(input);
    }
  });
});

// Save Input Value Function
function saveInputValue(input) {
  const textElement = input.previousElementSibling;
  const newValue = input.value.trim();
  textElement.textContent = newValue;
  input.style.display = "none";
  textElement.style.display = "inline";
  saveData();
}

// Save Changes Function
function saveChanges() {
  const fields = ["job", "ping", "guild", "race", "title", "region", "location"];
  fields.forEach(field => {
    const inputValue = document.getElementById(`${field}-input`).value;
    if (inputValue) {
      document.getElementById(`${field}-text`).textContent = inputValue;
    }
  });
  toggleEditMode();
}

// Update Progress Bar Function
function updateProgressBar(stat) {
  const fillElement = document.getElementById(`${stat}-fill`);
  const valueText = fillElement.parentElement.nextElementSibling.textContent;
  const [currentValue, maxValue] = valueText.split("/").map(Number);
  const percentage = (currentValue / maxValue) * 100;
  fillElement.style.width = `${percentage}%`;
}

// Update All Progress Bars on Page Load
["hp", "mp", "stm", "exp"].forEach(stat => updateProgressBar(stat));

// Level Up Functionality
function levelUp() {
  const levelNumber = document.querySelector(".level-number");
  const newLevel = parseInt(levelNumber.textContent) + 1;
  levelNumber.textContent = newLevel;
  document.querySelector(".quests .status:not(.done)").textContent = `Lv.${newLevel}`;
  document.getElementById("rank-text").textContent = getRank(newLevel);
}

// Check for Level Up Function
function checkForLevelUp() {
  const savedData = JSON.parse(localStorage.getItem("gameData"));
  if (savedData?.exp >= 100) {
    while (savedData.exp >= 100) {
      savedData.exp -= 100;
      savedData.level += 1;
      
      // Award skill points on level up
      savedData.skillPoints = (savedData.skillPoints || 0) + 1;
      
      // Apply skill effects if any
      applySkillEffects(savedData);
      
      for (let key in savedData.stackedAttributes) {
            if (savedData.Attributes[key] !== undefined) {
                savedData.Attributes[key] += customRound(savedData.stackedAttributes[key]*0.25);
            }
        }
        // Reset stackedAttributes  applying them to Attributes
        for (let key in savedData.stackedAttributes) {
            savedData.stackedAttributes[key] = 0;
        }
    }
    document.querySelector(".level-number").textContent = savedData.level;
    document.getElementById("exp-fill").style.width = `${(savedData.exp / 100) * 100}%`;
    document.getElementById("XPvalue").textContent = `${savedData.exp}/100`;
    document.getElementById("rank-text").textContent = getRank(savedData.level);
    localStorage.setItem("gameData", JSON.stringify(savedData));
    syncToDatabase()
    loadData();
    
    // Show skill point notification
    showNotification(`Level Up! +1 Skill Point earned!`, 'success');
  }
}

// Apply skill effects to stats
function applySkillEffects(savedData) {
  if (!savedData.unlockedSkills) return;
  
  savedData.unlockedSkills.forEach(skill => {
    switch(skill) {
      case 'iron-will':
        savedData.hp = Math.min(100, savedData.hp + 20);
        break;
      case 'berserker':
        savedData.Attributes.STR += 5;
        savedData.Attributes.AGI += 3;
        break;
      case 'speed-demon':
        savedData.Attributes.AGI += 8;
        savedData.fatigue = Math.max(0, savedData.fatigue - 20);
        break;
      case 'photographic-memory':
        savedData.Attributes.INT += 5;
        savedData.expGainBonus = (savedData.expGainBonus || 0) + 10;
        break;
      case 'mind-over-matter':
        savedData.mp = Math.min(100, savedData.mp + 50);
        savedData.Attributes.INT += 3;
        break;
      case 'eagle-eye':
        savedData.Attributes.PER += 6;
        savedData.questRewardBonus = (savedData.questRewardBonus || 0) + 15;
        break;
    }
  });
}


