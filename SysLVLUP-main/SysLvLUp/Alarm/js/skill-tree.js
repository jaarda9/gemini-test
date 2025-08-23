// Skill Tree System
class SkillTree {
    constructor() {
        this.gameData = null;
        this.skills = {};
        this.init();
    }

    init() {
        this.loadGameData();
        this.setupEventListeners();
        this.updateSkillPoints();
        this.updateSkillStates();
    }

    loadGameData() {
        const savedData = localStorage.getItem("gameData");
        if (savedData) {
            this.gameData = JSON.parse(savedData);
        } else {
            // Initialize with default data if none exists
            this.gameData = {
                level: 1,
                skillPoints: 0,
                unlockedSkills: [],
                Attributes: {
                    STR: 10,
                    VIT: 10,
                    AGI: 10,
                    INT: 10,
                    PER: 10,
                    WIS: 10
                }
            };
            localStorage.setItem("gameData", JSON.stringify(this.gameData));
        }
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.category);
            });
        });

        // Skill node clicking
        document.querySelectorAll('.skill-node').forEach(node => {
            node.addEventListener('click', (e) => {
                this.handleSkillClick(e.currentTarget);
            });
        });
    }

    switchTab(category) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Update skill trees
        document.querySelectorAll('.skill-tree').forEach(tree => {
            tree.classList.remove('active');
        });
        document.getElementById(`${category}-tree`).classList.add('active');
    }

    handleSkillClick(skillNode) {
        const skillName = skillNode.dataset.skill;
        const requirements = JSON.parse(skillNode.dataset.requirements);
        
        if (skillNode.classList.contains('locked')) {
            this.showSkillInfo(skillNode, 'locked');
            return;
        }

        if (skillNode.classList.contains('available')) {
            this.unlockSkill(skillNode, skillName);
        } else if (skillNode.classList.contains('unlocked')) {
            this.showSkillInfo(skillNode, 'unlocked');
        }
    }

    unlockSkill(skillNode, skillName) {
        if (this.gameData.skillPoints <= 0) {
            this.showNotification('Not enough skill points!', 'error');
            return;
        }

        // Deduct skill point
        this.gameData.skillPoints--;
        
        // Add to unlocked skills
        if (!this.gameData.unlockedSkills) {
            this.gameData.unlockedSkills = [];
        }
        this.gameData.unlockedSkills.push(skillName);

        // Apply skill effects
        this.applySkillEffects(skillName);

        // Update UI
        skillNode.classList.remove('available');
        skillNode.classList.add('unlocked');
        skillNode.classList.add('unlocking');

        // Remove animation class after animation completes
        setTimeout(() => {
            skillNode.classList.remove('unlocking');
        }, 600);

        // Save data
        this.saveGameData();
        this.updateSkillPoints();
        this.updateSkillStates();

        this.showNotification(`Skill "${skillName}" unlocked!`, 'success');
    }

    applySkillEffects(skillName) {
        const effects = {
            'iron-will': () => {
                this.gameData.hp = Math.min(100, this.gameData.hp + 20);
            },
            'berserker': () => {
                this.gameData.Attributes.STR += 5;
                this.gameData.Attributes.AGI += 3;
            },
            'regeneration': () => {
                // This will be handled by the regeneration system
                this.gameData.hasRegeneration = true;
            },
            'speed-demon': () => {
                this.gameData.Attributes.AGI += 8;
                this.gameData.fatigue = Math.max(0, this.gameData.fatigue - 20);
            },
            'photographic-memory': () => {
                this.gameData.Attributes.INT += 5;
                this.gameData.expGainBonus = (this.gameData.expGainBonus || 0) + 10;
            },
            'mind-over-matter': () => {
                this.gameData.mp = Math.min(100, this.gameData.mp + 50);
                this.gameData.Attributes.INT += 3;
            },
            'eagle-eye': () => {
                this.gameData.Attributes.PER += 6;
                this.gameData.questRewardBonus = (this.gameData.questRewardBonus || 0) + 15;
            },
            'wisdom-seeker': () => {
                Object.keys(this.gameData.Attributes).forEach(attr => {
                    this.gameData.Attributes[attr] += 2;
                });
                this.gameData.Attributes.WIS += 10;
            },
            'inner-peace': () => {
                this.gameData.fatigue = Math.max(0, this.gameData.fatigue - 30);
                this.gameData.Attributes.WIS += 4;
            },
            'soul-bond': () => {
                this.gameData.hasMpRegeneration = true;
            },
            'transcendence': () => {
                this.gameData.levelUpReduction = (this.gameData.levelUpReduction || 0) + 20;
            },
            'lucky-charm': () => {
                this.gameData.luckyCharmBonus = (this.gameData.luckyCharmBonus || 0) + 25;
            },
            'time-master': () => {
                this.gameData.dailyResetExtension = (this.gameData.dailyResetExtension || 0) + 2;
            },
            'skill-specialist': () => {
                this.gameData.skillPointBonus = (this.gameData.skillPointBonus || 0) + 50;
            }
        };

        if (effects[skillName]) {
            effects[skillName]();
        }
    }

    checkRequirements(requirements) {
        if (!this.gameData) return false;

        for (const [req, value] of Object.entries(requirements)) {
            if (req === 'level') {
                if (this.gameData.level < value) return false;
            } else if (this.gameData.Attributes[req.toUpperCase()] < value) {
                return false;
            }
        }
        return true;
    }

    updateSkillStates() {
        document.querySelectorAll('.skill-node').forEach(node => {
            const skillName = node.dataset.skill;
            const requirements = JSON.parse(node.dataset.requirements);
            
            // Remove all state classes
            node.classList.remove('locked', 'available', 'unlocked');
            
            // Check if already unlocked
            if (this.gameData.unlockedSkills && this.gameData.unlockedSkills.includes(skillName)) {
                node.classList.add('unlocked');
            } else if (this.checkRequirements(requirements)) {
                node.classList.add('available');
            } else {
                node.classList.add('locked');
            }
        });
    }

    updateSkillPoints() {
        document.getElementById('skill-points').textContent = this.gameData.skillPoints || 0;
    }

    showSkillInfo(skillNode, state) {
        const infoPanel = document.querySelector('.info-content');
        const skillName = skillNode.querySelector('h3').textContent;
        const description = skillNode.querySelector('p').textContent;
        const requirements = skillNode.querySelector('.requirements').textContent;

        let infoText = '';
        if (state === 'locked') {
            infoText = `<strong>${skillName}</strong><br>${description}<br><br><em>${requirements}</em><br><br>This skill is locked. Meet the requirements to unlock it.`;
        } else if (state === 'unlocked') {
            infoText = `<strong>${skillName}</strong><br>${description}<br><br>✅ This skill is already unlocked and active!`;
        }

        infoPanel.innerHTML = infoText;
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

    saveGameData() {
        localStorage.setItem("gameData", JSON.stringify(this.gameData));
        
        // Sync to database
        this.syncToDatabase();
    }

    async syncToDatabase() {
        try {
            // Use the centralized syncToDatabase function
            await syncToDatabase();
            console.log('Skill tree data synced successfully');
        } catch (error) {
            console.error('Error syncing skill tree data:', error);
        }
    }

    // Method to award skill points (called from other parts of the game)
    awardSkillPoints(points = 1) {
        this.gameData.skillPoints = (this.gameData.skillPoints || 0) + points;
        this.saveGameData();
        this.updateSkillPoints();
        this.showNotification(`+${points} Skill Point${points > 1 ? 's' : ''} earned!`, 'success');
    }

    // Method to check if a skill is unlocked
    isSkillUnlocked(skillName) {
        return this.gameData.unlockedSkills && this.gameData.unlockedSkills.includes(skillName);
    }

    // Method to get skill effects for other parts of the game
    getSkillEffects() {
        const effects = {};
        
        if (this.gameData.unlockedSkills) {
            this.gameData.unlockedSkills.forEach(skill => {
                effects[skill] = true;
            });
        }

        return effects;
    }
}

// Initialize skill tree when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.skillTree = new SkillTree();
});

// Export for use in other scripts
window.SkillTree = SkillTree;
