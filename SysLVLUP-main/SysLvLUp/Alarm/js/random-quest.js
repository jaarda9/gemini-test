import { syncToDatabase } from './sync-utils.js';

// Random Quest Popup System
class RandomQuestSystem {
    constructor() {
        this.gameData = null;
        this.questTypes = {
            physical: [
                {
                    title: "Sprint Challenge",
                    description: "Run at full speed for 15 minutes",
                    reward: { exp: 25, str: 2, agi: 3 },
                    difficulty: "medium",
                    icon: "🏃‍♂️"
                },
                {
                    title: "Strength Training",
                    description: "Do 50 push-ups and 50 squats",
                    reward: { exp: 30, str: 4, vit: 2 },
                    difficulty: "hard",
                    icon: "💪"
                },
                {
                    title: "Endurance Test",
                    description: "Walk for 30 minutes without stopping",
                    reward: { exp: 20, vit: 3, agi: 1 },
                    difficulty: "easy",
                    icon: "🚶‍♂️"
                },
                {
                    title: "Agility Challenge",
                    description: "Do 20 jumping jacks and 10 burpees",
                    reward: { exp: 35, agi: 4, str: 2 },
                    difficulty: "medium",
                    icon: "🤸‍♂️"
                },
                {
                    title: "Marathon Prep",
                    description: "Jog for 45 minutes at steady pace",
                    reward: { exp: 40, vit: 5, agi: 2 },
                    difficulty: "hard",
                    icon: "🏃‍♀️"
                }
            ],
            mental: [
                {
                    title: "Memory Master",
                    description: "Memorize and recite 20 random words",
                    reward: { exp: 25, int: 3, per: 2 },
                    difficulty: "medium",
                    icon: "🧠"
                },
                {
                    title: "Speed Reading",
                    description: "Read 10 pages of any book in 15 minutes",
                    reward: { exp: 30, int: 4, per: 1 },
                    difficulty: "medium",
                    icon: "📚"
                },
                {
                    title: "Puzzle Solver",
                    description: "Complete a crossword puzzle or Sudoku",
                    reward: { exp: 35, int: 5, wis: 2 },
                    difficulty: "hard",
                    icon: "🧩"
                },
                {
                    title: "Focus Training",
                    description: "Meditate for 20 minutes without moving",
                    reward: { exp: 20, wis: 3, int: 2 },
                    difficulty: "easy",
                    icon: "🧘‍♂️"
                },
                {
                    title: "Learning Spree",
                    description: "Watch an educational video and take notes",
                    reward: { exp: 25, int: 3, wis: 2 },
                    difficulty: "medium",
                    icon: "📝"
                }
            ],
            spiritual: [
                {
                    title: "Inner Peace",
                    description: "Spend 30 minutes in complete silence",
                    reward: { exp: 30, wis: 4, vit: 1 },
                    difficulty: "medium",
                    icon: "🕉️"
                },
                {
                    title: "Gratitude Practice",
                    description: "Write down 10 things you're grateful for",
                    reward: { exp: 25, wis: 3, int: 1 },
                    difficulty: "easy",
                    icon: "🙏"
                },
                {
                    title: "Nature Connection",
                    description: "Spend 20 minutes observing nature",
                    reward: { exp: 20, wis: 2, per: 3 },
                    difficulty: "easy",
                    icon: "🌿"
                },
                {
                    title: "Mindful Breathing",
                    description: "Practice deep breathing for 15 minutes",
                    reward: { exp: 25, wis: 3, vit: 2 },
                    difficulty: "easy",
                    icon: "🫁"
                },
                {
                    title: "Self-Reflection",
                    description: "Write a journal entry about your day",
                    reward: { exp: 30, wis: 4, int: 2 },
                    difficulty: "medium",
                    icon: "📖"
                }
            ],
            creative: [
                {
                    title: "Artistic Expression",
                    description: "Draw or paint something for 30 minutes",
                    reward: { exp: 35, int: 3, wis: 2 },
                    difficulty: "medium",
                    icon: "🎨"
                },
                {
                    title: "Musical Journey",
                    description: "Listen to a new genre of music",
                    reward: { exp: 20, int: 2, wis: 1 },
                    difficulty: "easy",
                    icon: "🎵"
                },
                {
                    title: "Creative Writing",
                    description: "Write a short story or poem",
                    reward: { exp: 40, int: 4, wis: 3 },
                    difficulty: "hard",
                    icon: "✍️"
                },
                {
                    title: "Photography Quest",
                    description: "Take 10 creative photos",
                    reward: { exp: 30, per: 4, int: 2 },
                    difficulty: "medium",
                    icon: "📸"
                },
                {
                    title: "Crafting Challenge",
                    description: "Create something with your hands",
                    reward: { exp: 35, agi: 3, int: 2 },
                    difficulty: "medium",
                    icon: "🔨"
                }
            ],
            social: [
                {
                    title: "Kindness Quest",
                    description: "Do 3 random acts of kindness",
                    reward: { exp: 30, wis: 3, int: 2 },
                    difficulty: "medium",
                    icon: "❤️"
                },
                {
                    title: "Conversation Master",
                    description: "Have a meaningful conversation with someone",
                    reward: { exp: 25, int: 2, wis: 3 },
                    difficulty: "medium",
                    icon: "💬"
                },
                {
                    title: "Help Someone",
                    description: "Offer help to someone in need",
                    reward: { exp: 35, wis: 4, int: 2 },
                    difficulty: "medium",
                    icon: "🤝"
                },
                {
                    title: "Learn from Others",
                    description: "Ask someone to teach you something",
                    reward: { exp: 30, int: 3, wis: 2 },
                    difficulty: "medium",
                    icon: "👥"
                },
                {
                    title: "Share Knowledge",
                    description: "Teach someone something you know",
                    reward: { exp: 40, int: 4, wis: 3 },
                    difficulty: "hard",
                    icon: "🎓"
                }
            ]
        };
        
        this.init();
    }

    init() {
        this.loadGameData();
        this.setupQuestTimer();
        this.createQuestPopup();
    }

    loadGameData() {
        const savedData = localStorage.getItem("gameData");
        if (savedData) {
            this.gameData = JSON.parse(savedData);
        }
    }

    setupQuestTimer() {
        // Generate a random quest every 30-90 minutes
        const randomInterval = Math.random() * (90 - 30) + 30;
        setTimeout(() => {
            this.generateRandomQuest();
            this.setupQuestTimer(); // Setup next quest
        }, randomInterval * 60 * 1000);
    }

    generateRandomQuest() {
        const categories = Object.keys(this.questTypes);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const quests = this.questTypes[randomCategory];
        const randomQuest = quests[Math.floor(Math.random() * quests.length)];
        
        this.showQuestPopup(randomQuest);
    }

    createQuestPopup() {
        // Create the quest popup HTML
        const popupHTML = `
            <div id="quest-popup" class="quest-popup hidden">
                <div class="quest-popup-content">
                    <div class="quest-header">
                        <div class="quest-alert">🚨 ALERT: NEW QUEST 🚨</div>
                        <button class="quest-close-btn" onclick="randomQuestSystem.closeQuestPopup()">×</button>
                    </div>
                    <div class="quest-body">
                        <div class="quest-icon" id="quest-icon">🎯</div>
                        <h2 class="quest-title" id="quest-title">Quest Title</h2>
                        <p class="quest-description" id="quest-description">Quest description goes here</p>
                        <div class="quest-difficulty" id="quest-difficulty">Difficulty: Medium</div>
                        <div class="quest-rewards">
                            <h3>Rewards:</h3>
                            <div class="reward-list" id="reward-list">
                                <!-- Rewards will be populated here -->
                            </div>
                        </div>
                    </div>
                    <div class="quest-actions">
                        <button class="quest-accept-btn" onclick="randomQuestSystem.acceptQuest()">Accept Quest</button>
                        <button class="quest-decline-btn" onclick="randomQuestSystem.declineQuest()">Decline</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }

    showQuestPopup(quest) {
        const popup = document.getElementById('quest-popup');
        const icon = document.getElementById('quest-icon');
        const title = document.getElementById('quest-title');
        const description = document.getElementById('quest-description');
        const difficulty = document.getElementById('quest-difficulty');
        const rewardList = document.getElementById('reward-list');

        // Set quest data
        icon.textContent = quest.icon;
        title.textContent = quest.title;
        description.textContent = quest.description;
        difficulty.textContent = `Difficulty: ${quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}`;
        difficulty.className = `quest-difficulty ${quest.difficulty}`;

        // Set rewards
        rewardList.innerHTML = '';
        Object.entries(quest.reward).forEach(([stat, value]) => {
            const rewardItem = document.createElement('div');
            rewardItem.className = 'reward-item';
            rewardItem.innerHTML = `<span class="reward-stat">${stat.toUpperCase()}</span> +${value}`;
            rewardList.appendChild(rewardItem);
        });

        // Store current quest
        this.currentQuest = quest;

        // Show popup with animation
        popup.classList.remove('hidden');
        setTimeout(() => {
            popup.classList.add('show');
        }, 100);
    }

    closeQuestPopup() {
        const popup = document.getElementById('quest-popup');
        popup.classList.remove('show');
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 300);
    }

    acceptQuest() {
        if (!this.currentQuest) return;

        // Add quest to active quests
        if (!this.gameData.activeQuests) {
            this.gameData.activeQuests = [];
        }

        const questData = {
            ...this.currentQuest,
            id: Date.now(),
            acceptedAt: new Date().toISOString(),
            completed: false
        };

        this.gameData.activeQuests.push(questData);
        this.saveGameData();

        this.showNotification(`Quest "${this.currentQuest.title}" accepted!`, 'success');
        this.closeQuestPopup();
    }

    declineQuest() {
        this.showNotification('Quest declined. Another will appear soon!', 'info');
        this.closeQuestPopup();
    }

    completeQuest(questId) {
        const questIndex = this.gameData.activeQuests.findIndex(q => q.id === questId);
        if (questIndex === -1) return;

        const quest = this.gameData.activeQuests[questIndex];
        
        // Apply rewards
        Object.entries(quest.reward).forEach(([stat, value]) => {
            if (stat === 'exp') {
                this.gameData.exp = (this.gameData.exp || 0) + value;
            } else if (this.gameData.Attributes && this.gameData.Attributes[stat.toUpperCase()]) {
                this.gameData.Attributes[stat.toUpperCase()] += value;
            }
        });

        // Remove quest from active quests
        this.gameData.activeQuests.splice(questIndex, 1);
        this.saveGameData();

        this.showNotification(`Quest "${quest.title}" completed! Rewards applied!`, 'success');
        this.loadData(); // Update UI
    }

    saveGameData() {
        localStorage.setItem("gameData", JSON.stringify(this.gameData));
        this.syncToDatabase();
    }

    async syncToDatabase() {
        try {
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: 'your-user-id',
                    localStorageData: this.gameData
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Quest data synced successfully');
        } catch (error) {
            console.error('Error syncing quest data:', error);
        }
    }

    showNotification(message, type = 'success') {
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

    // Method to manually trigger a quest (for testing)
    triggerQuest() {
        this.generateRandomQuest();
    }
}

// Initialize random quest system when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.randomQuestSystem = new RandomQuestSystem();
});

// Export for use in other scripts
window.RandomQuestSystem = RandomQuestSystem;
