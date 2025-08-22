import { syncToDatabase } from './sync-utils.js';

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
          })
          
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
      case 'wisdom-seeker':
        Object.keys(savedData.Attributes).forEach(attr => {
          savedData.Attributes[attr] += 2;
        });
        savedData.Attributes.WIS += 10;
        break;
      case 'inner-peace':
        savedData.fatigue = Math.max(0, savedData.fatigue - 30);
        savedData.Attributes.WIS += 4;
        break;
    }
  });
}

// Show notification function
function showNotification(message, type = 'success') {
  // Remove existing notifications
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create new notification
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Get Rank Function
function getRank(level) {
  if (level >= 1 && level <= 10) return ranks[0]; // E-Rank
  if (level >= 11 && level <= 30) return ranks[1]; // D-Rank
  if (level >= 31 && level <= 50) return ranks[2]; // C-Rank
  if (level >= 51 && level <= 80) return ranks[3]; // B-Rank
  if (level >= 81 && level <= 100) return ranks[4]; // A-Rank
  if (level >= 101) return ranks[5]; // S-Rank
}
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
          })
          
  }

  // Call the measurePing function with a URL to ping
  measurePing('https://sys-lvlup.vercel.app/status.html'); // Replace with your server URL
});

// Load Data Function
function loadData() {
  const savedData = JSON.parse(localStorage.getItem("gameData"));
  if (savedData) {
    document.querySelector(".level-number").textContent = savedData.level;
    document.getElementById("HPvalue").textContent = savedData.hp + "/100";
    document.getElementById("hp-fill").style.width = savedData.hp + "%";
    document.getElementById("MPvalue").textContent = savedData.mp + "/100";
    document.getElementById("mp-fill").style.width = savedData.mp + "%";
    document.getElementById("stm-fill").style.width = savedData.stm + "%";
    document.getElementById("STMvalue").textContent = savedData.stm + "/100";
    document.getElementById("exp-fill").style.width = savedData.exp + "%";
    document.getElementById("XPvalue").textContent = savedData.exp + "/100";
    document.querySelector(".fatigue-value").textContent = savedData.fatigue;
    document.getElementById("job-text").textContent = savedData.name;
    document.getElementById("guild-text").textContent = savedData.guild;
    document.getElementById("race-text").textContent = savedData.race;
    document.getElementById("title-text").textContent = savedData.title;
    document.getElementById("region-text").textContent = savedData.region;
    document.getElementById("location-text").textContent = savedData.location;
    document.getElementById("rank-text").textContent = getRank(savedData.level);
    document.querySelector(".quests .status:not(.done)").textContent = `Lv.${savedData.level}`;
    document.getElementById("str").textContent = `STR: ${savedData.Attributes.STR}`;
    document.getElementById("vit").textContent = `VIT: ${savedData.Attributes.VIT}`;
    document.getElementById("agi").textContent = `AGI: ${savedData.Attributes.AGI}`;
    document.getElementById("int").textContent = `INT: ${savedData.Attributes.INT}`;
    document.getElementById("per").textContent = `PER: ${savedData.Attributes.PER}`;
    document.getElementById("wis").textContent = `WIS: ${savedData.Attributes.WIS}`;
  }
  else{
    resetData();
  }
}


// Save Data Function
function saveData() {
  // Retrieve existing data from localStorage, or initialize with an empty object if not present
  const existingData = JSON.parse(localStorage.getItem("gameData")) || {};

  // New data to update
  const updatedData = {
    level: document.querySelector(".level-number").textContent,
    hp: parseFloat(document.getElementById("hp-fill").style.width),
    mp: parseFloat(document.getElementById("mp-fill").style.width),
    stm: parseFloat(document.getElementById("stm-fill").style.width),
    exp: parseFloat(document.getElementById("exp-fill").style.width),
    fatigue: document.getElementById("Fatvalue").textContent,
    name: document.getElementById("job-text").textContent,
    ping: document.getElementById("ping-text").textContent,
    guild: document.getElementById("guild-text").textContent,
    race: document.getElementById("race-text").textContent,
    title: document.getElementById("title-text").textContent,
    region: document.getElementById("region-text").textContent,
    location: document.getElementById("location-text").textContent,
  };

  // Merge existing data with updated data, updating only specified keys
  const newData = { ...existingData, ...updatedData };

  // Save the merged data back to localStorage
  localStorage.setItem("gameData", JSON.stringify(newData));
  syncToDatabase();
}


// Reset Data Function
function resetData() {
  const defaultGameData = {
    level: 1,
    hp: 100,
    mp: 100,
    stm: 100,
    exp: 0,
    fatigue: 0,
    name: "Your Name",
    ping: "60",
    guild: "Reaper",
    race: "Hunter",
    title: "None",
    region: "TN",
    location: "Hospital",
    physicalQuests: "[0/4]",
    mentalQuests: "[0/3]",
    spiritualQuests: "[0/2]",
    skillPoints: 0,
    unlockedSkills: [],
    activeQuests: [],
    Attributes: {
      STR: 10,
      VIT: 10,
      AGI: 10,
      INT: 10,
      PER: 10,
      WIS: 10,
    },
    stackedAttributes: {
      STR: 0,
      VIT: 0,
      AGI: 0,
      INT: 0,
      PER: 0,
      WIS: 0,
    },
  };
  localStorage.setItem("gameData", JSON.stringify(defaultGameData));
  syncToDatabase()
  location.reload();
}

// Check for New Day Function
function checkForNewDay() {
  const currentDate = new Date().toLocaleDateString(); // Get today's date
  const lastResetDate = localStorage.getItem("lastResetDate"); // Get the last reset date from localStorage

  console.log("Current Date:", currentDate);
  console.log("Last Reset Date:", lastResetDate);

  // If no date is saved or the day has changed, reset the stats
  if (!lastResetDate || lastResetDate !== currentDate) {
    console.log("Resetting daily stats...");
    currentSTS = 0; // Reset daily quests
    localStorage.setItem("STS", currentSTS); // Update STS in localStorage
    resetDailyStats(); // Reset daily stats
    localStorage.setItem("lastResetDate", currentDate); // Update the last reset date
    syncToDatabase();
  } else {
    console.log("No reset needed.");
  }
}

// Reset Daily Stats Function
function resetDailyStats() {
  const savedData = JSON.parse(localStorage.getItem("gameData"));
  if (savedData) {
    console.log("Resetting stats for:", savedData.name);
    // Reset relevant stats
    savedData.hp = 100;
    savedData.stm = 100;
    savedData.mp = 100;
    savedData.fatigue = 0;
    savedData.mentalQuests = "[0/3]";
    savedData.physicalQuests = "[0/4]";
    savedData.spiritualQuests = "[0/2]";

    // Update the UI elements accordingly
    document.getElementById("HPvalue").textContent = savedData.hp + "/100";
    document.getElementById("hp-fill").style.width = savedData.hp + "%";
    document.getElementById("MPvalue").textContent = savedData.mp + "/100";
    document.getElementById("mp-fill").style.width = savedData.mp + "%";
    document.getElementById("stm-fill").style.width = savedData.stm + "%";
    document.getElementById("STMvalue").textContent = savedData.stm + "/100";
    document.querySelector(".fatigue-value").textContent = savedData.fatigue;

    // Save the updated data back to localStorage
    localStorage.setItem("gameData", JSON.stringify(savedData));
    console.log("Daily stats reset successfully.");
  } else {
    console.error("No saved data found for resetting stats.");
  }
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("Page loaded.");
  
  loadData(); // Load existing data
  updateFatigueProgress(); // Update fatigue progress
  checkForLevelUp(); // Check for level up
  checkForNewDay(); // Check if it's a new day to reset stats
  
  // Start regeneration system
  startRegenerationSystem();
  
  // Initialize random quest system and display active quests
  setTimeout(() => {
    if (window.randomQuestSystem) {
      displayActiveRandomQuests();
    }
  }, 1000);
});

// Regeneration system for skills
function startRegenerationSystem() {
  setInterval(() => {
    const savedData = JSON.parse(localStorage.getItem("gameData"));
    if (!savedData) return;
    
    let updated = false;
    
    // HP Regeneration (Iron Will skill)
    if (savedData.unlockedSkills && savedData.unlockedSkills.includes('regeneration')) {
      if (savedData.hp < 100) {
        savedData.hp = Math.min(100, savedData.hp + 5);
        updated = true;
      }
    }
    
    // MP Regeneration (Soul Bond skill)
    if (savedData.unlockedSkills && savedData.unlockedSkills.includes('soul-bond')) {
      if (savedData.mp < 100) {
        savedData.mp = Math.min(100, savedData.mp + 10);
        updated = true;
      }
    }
    
    if (updated) {
      localStorage.setItem("gameData", JSON.stringify(savedData));
      loadData(); // Update UI
    }
  }, 3600000); // Check every hour (3600000ms)
}

// Display active random quests
function displayActiveRandomQuests() {
  const savedData = JSON.parse(localStorage.getItem("gameData"));
  const activeQuestsContainer = document.getElementById('active-random-quests');
  const questsList = document.getElementById('random-quests-list');
  
  if (!savedData || !savedData.activeQuests || savedData.activeQuests.length === 0) {
    activeQuestsContainer.style.display = 'none';
    return;
  }
  
  activeQuestsContainer.style.display = 'block';
  questsList.innerHTML = '';
  
  savedData.activeQuests.forEach(quest => {
    const questItem = document.createElement('div');
    questItem.className = 'quest-item';
    questItem.innerHTML = `
      <div class="quest-item-info">
        <div class="quest-item-title">${quest.icon} ${quest.title}</div>
        <div class="quest-item-description">${quest.description}</div>
      </div>
      <button class="complete-quest-btn" onclick="completeRandomQuest(${quest.id})">Complete</button>
    `;
    questsList.appendChild(questItem);
  });
}

// Complete a random quest
function completeRandomQuest(questId) {
  if (window.randomQuestSystem) {
    window.randomQuestSystem.completeQuest(questId);
    displayActiveRandomQuests(); // Refresh the display
  }
}


const gameData = {
    level: 1,
    hp: 100,
    mp: 100,
    stm: 100,
    exp: 0,
    fatigue: 0,
    name: "Your Name",
    ping: "60",
    guild: "Reaper",
    race: "Hunter",
    title: "None",
    region: "TN",
    location: "Hospital",
    physicalQuests: "[0/4]",
    mentalQuests: "[0/3]",
    spiritualQuests: "[0/2]",
    Attributes: {
      STR: 10,
      VIT: 10,
      AGI: 10,
      INT: 10,
      PER: 10,
      WIS: 10,
    },
    stackedAttributes: {
      STR: 0,
      VIT: 0,
      AGI: 0,
      INT: 0,
      PER: 0,
      WIS: 0,
    },

}
console.log(gameData);

function importData(event) {
  const file = event.target.files[0]; // Get the selected file
  if (!file) {
      alert("No file selected.");
      return;
  }

  const reader = new FileReader(); // Create a FileReader instance
  reader.onload = function(e) {
      try {
          const importedData = JSON.parse(e.target.result); // Parse the file content
          
          // Clear existing local storage (optional)
          localStorage.clear();
          
          // Store each key-value pair back into local storage
          for (const key in importedData) {
              if (importedData.hasOwnProperty(key)) {
                  localStorage.setItem(key, importedData[key]);
                syncToDatabase()
              }
          }
          
          // Show success notification
          const notification = document.getElementById("notification");
          notification.classList.remove("hidden"); // Remove hidden class
          notification.classList.add("show"); // Add show class
          
          setTimeout(() => {
              notification.classList.remove("show"); // Hide after 2 seconds
              notification.classList.add("hidden"); // Add hidden class back
          }, 2500); // 2 seconds delay before hiding
          
          // Redirect after a short delay
          setTimeout(() => {
              window.location.href = "status.html"; // Redirect to status.html
          }, 2500); // Same delay for redirecting
      } catch (error) {
          alert("Failed to import data. Please make sure the file is valid."); // Error handling
      }
  };
  reader.readAsText(file); // Read the file as text
}

function exportData() {
  const allData = {}; // Create an object to hold all local storage data

  // Iterate through all local storage items
  for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      allData[key] = value; // Store in the object
  }

  // Function to format the date
  function formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      const formattedDate = date.toLocaleDateString('en-US', options).replace(/\//g, '-'); // Format as MM-DD-YYYY
      const formattedTime = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // Format as HH-MM-SS
      return `${formattedDate}_${formattedTime}`; // Combine date and time
  }

  const currentDate = new Date();
  const dateString = formatDate(currentDate); // Get the formatted date string

  // Convert the allData object to a JSON string
  const jsonData = JSON.stringify(allData, null, 2); // Pretty print with 2 spaces

  // Create a Blob from the JSON string
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gamedata_${dateString}.json`; // Use the formatted date in the filename
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // Clean up
}


window.onload = function() {
  loadData(); // Load existing data
  updateFatigueProgress(); // Update fatigue progress
  checkForLevelUp(); // Check for level up

  // Check the player's name and show the popup if necessary
  const playerName = document.getElementById("job-text").textContent;
  if (playerName === "Your Name") {
      document.getElementById("name-popup").classList.remove("hidden"); // Show the popup
      
  }
  else{
    closePopup();
  }



  // Submit name functionality
 // Submit name functionality
document.getElementById("submit-name").onclick = function() {
  const nameInput = document.getElementById("name-input").value.trim();
  if (nameInput) {
      document.getElementById("job-text").textContent = nameInput; // Update name in status
      saveData(); // Save updated name to local storage
      closePopup();
      // Trigger closing animation for the popup
      const popup = document.getElementById("name-popup");
      popup.classList.add("hidden"); // Start the closing animation
      
      // After the animation, hide the popup and trigger status container animation
      setTimeout(() => {
          popup.style.display = 'none'; // Hide the popup completely
          
          // Trigger animation on the status container
          const statusContainer = document.querySelector('.status-container');
          if (statusContainer) {
              statusContainer.classList.add('animate'); // Add animation class
          }
      }, 600); // Match the timeout with the CSS transition duration
  } else {
      // Alert if the input is empty
  }
};
// Function to close the popup
function closePopup() {
  const popup = document.getElementById("name-popup");
  popup.classList.add("hidden"); // Hide the popup
  
  // Wait for the animation to finish before hiding the popup
  setTimeout(() => {
      popup.style.display = 'none'; // Hide the popup completely

      // Show the status container and trigger the dropdown animation
      const statusContainer = document.querySelector('.status-container');
      if (statusContainer) {
          statusContainer.classList.remove('hidden'); // Make sure the status container is visible
          statusContainer.style.animation = 'dropDown 2s ease forwards'; // Apply dropdown animation
      }
  }, 600); // Match the timeout with the CSS transition duration
}
};

document.addEventListener('DOMContentLoaded', function() {
  // Function to handle file import
 
  // Event listener for the import input
  document.getElementById("import-input").addEventListener("change", importData);

  // Event listener for the import button
  
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
