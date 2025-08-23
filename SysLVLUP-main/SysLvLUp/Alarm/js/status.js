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

// New Quest Button Functionality
document.getElementById("generate-quest-btn").addEventListener("click", function() {
    // Logic to generate a new quest
    console.log("Generating new quest...");
    // You can add your quest generation logic here
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
