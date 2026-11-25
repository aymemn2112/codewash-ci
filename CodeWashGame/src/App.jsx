import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Gift } from 'lucide-react';

// Modules
import SafeImage from './components/ui/SafeImage';
import CornerControls from './components/game/CornerControls';
import PlayerHealth from './components/game/PlayerHealth';
import LoadWarning from './components/game/LoadWarning';
import DeathOverlay from './components/game/DeathOverlay';
import DrawersLayer from './components/game/DrawersLayer';
import SkillCarousel from './components/game/SkillCarousel';
import LevelRestored from './components/game/LevelRestored';
import ResetModal from './components/modals/ResetModal';
import BugReportModal from './components/modals/BugReportModal';
import SettingsDrawer from './components/drawers/SettingsDrawer';
import CosmeticsDrawer from './components/drawers/CosmeticsDrawer';
import MenuDrawer from './components/drawers/MenuDrawer';
import SkillCard from './components/skills/SkillCard';
import PhantomEvent from './components/PhantomEvent';
import AchievementToast from './components/ui/AchievementToast';

// Utils & Constants
import { consumeLoadErrors } from './lib/loadErrors';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useFullscreen } from './hooks/useFullscreen';
import { generateChallenge } from './domain/challenges';
import { useCarousel } from './hooks/useCarousel';
import { useDrawers } from './hooks/useDrawers';
import { useAudioSettings } from './hooks/useAudioSettings';
import { useBorders } from './hooks/useBorders';
import {
    getStorageKey,
    loadSkills,
    loadTheme,
    loadStats,
    getProfileStats,
} from './domain/profileStorage';
import { browserStorage } from './services/storage';
import { STORAGE_KEYS } from './services/storageKeys';
import { defaultClock } from './services/clock';
import { defaultRng } from './services/rng';
import {
    getRandomMob,
    getRandomFriendlyMob,
    getRandomMiniboss,
    getRandomBoss,
    getEncounterType,
    calculateDamage,
    calculateMobHealth,
    calculateXPReward,
    calculateXPToLevel,
} from './utils/gameUtils';
import { getRandomAura } from './utils/mobDisplayUtils';
import {
    BASE_ASSETS,
    THEME_CONFIG,
    SKILL_DATA,
    HOMOPHONES,
    DIFFICULTY_CONTENT,
    HOSTILE_MOBS,
    BOSS_MOBS,
    MINIBOSS_MOBS,
    DEFAULT_THEME_ID,
} from './constants/gameData';
import {
    playActionCardLeft,
    playActionCardRight,
    playClick,
    playDeath,
    playFail,
    playLevelUp,
    playNotification,
    playSuccessfulHit,
    playMobHurt,
    playMobDeath,
    playAchievement,
} from './utils/soundManager';
import {
    getNewlyUnlockedAchievements,
    getNewTierAchievements,
    addUniqueToArray,
    isAchievementUnlocked,
} from './utils/achievementUtils';

// Parent verification privilege constants
const PARENT_PRIVILEGE_LEVEL = 200;
const PARENT_PRIVILEGE_DIFFICULTY = 7;
const PARENT_PRIVILEGE_BADGES = [1, 2, 3, 4, 5, 6, 7, 8];

// Voice recognition constants
const MIN_SPOKEN_TEXT_LENGTH = 2;
const MIC_OFF_TEXT = 'Mic Off';

// Boss healing animation duration (ms)
const BOSS_HEALING_ANIMATION_DURATION = 600;

const App = () => {
    const [currentProfile, setCurrentProfile] = useState(() =>
        browserStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE)
            ? parseInt(browserStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE), 10)
            : 1,
    );
    const [profileNames, setProfileNames] = useState(() =>
        browserStorage.getItem(STORAGE_KEYS.PROFILE_NAMES)
            ? JSON.parse(browserStorage.getItem(STORAGE_KEYS.PROFILE_NAMES))
            : { 1: 'Player 1', 2: 'Player 2', 3: 'Player 3' },
    );
    const [parentStatus, setParentStatus] = useState(() =>
        browserStorage.getItem(STORAGE_KEYS.PARENT_STATUS)
            ? JSON.parse(browserStorage.getItem(STORAGE_KEYS.PARENT_STATUS))
            : { 1: false, 2: false, 3: false },
    );
    const [playerHealth, setPlayerHealth] = useState(10);

    const [skills, setSkills] = useState(() => loadSkills(currentProfile));
    const [activeTheme, setActiveTheme] = useState(() => loadTheme(currentProfile));
    const [stats, setStats] = useState(() => loadStats(currentProfile));
    const [loadWarning, setLoadWarning] = useState(() => consumeLoadErrors().length > 0);
    const [achievementToast, setAchievementToast] = useState(null);
    const [battlingSkillId, setBattlingSkillId] = useState(null);
    const [battleDifficulty, setBattleDifficulty] = useState(null); // Track battle's starting difficulty for consistent challenge generation
    const [challengeData, setChallengeData] = useState(null);
    const [lootBox, setLootBox] = useState(null);
    const drawers = useDrawers();
    const [damageNumbers, setDamageNumbers] = useState([]);
    const carousel = useCarousel({
        battling: Boolean(battlingSkillId),
        onLeft: playActionCardLeft,
        onRight: playActionCardRight,
    });
    const [showDeathOverlay, setShowDeathOverlay] = useState(false);
    const [showLevelRestored, setShowLevelRestored] = useState(false);
    const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
    const [bossHealing, setBossHealing] = useState(null); // skillId of boss being healed
    const speech = useSpeechRecognition();
    const challengeDataRef = useRef(null);
    const damageIdRef = useRef(0); // Counter for generating unique damage number IDs
    const loginTrackedRef = useRef(false); // Track if we've already recorded today's login
    const audio = useAudioSettings();

    const borders = useBorders(currentProfile);

    useEffect(() => {
        const dataToSave = { skills: skills, theme: activeTheme, stats: stats };
        browserStorage.setItem(getStorageKey(currentProfile), JSON.stringify(dataToSave));
        browserStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, currentProfile);
        browserStorage.setItem(STORAGE_KEYS.PROFILE_NAMES, JSON.stringify(profileNames));
        browserStorage.setItem(STORAGE_KEYS.PARENT_STATUS, JSON.stringify(parentStatus));
    }, [skills, currentProfile, activeTheme, profileNames, parentStatus, stats]);

    // Calculate unlocked borders based on earned badges (memoized)
    const unlockedBorders = React.useMemo(() => {
        const unlockedBadges = new Set();
        // Tier to badge name mapping
        const tierToBadge = [
            'Wood',
            'Stone',
            'Gold',
            'Iron',
            'Emerald',
            'Diamond',
            'Netherite',
            'Obsidian',
        ];

        Object.values(skills).forEach((skill) => {
            if (skill.earnedBadges && Array.isArray(skill.earnedBadges)) {
                skill.earnedBadges.forEach((tier) => {
                    // Convert tier number to badge name (tier 1 = Wood = index 0)
                    if (tier >= 1 && tier <= 8) {
                        unlockedBadges.add(tierToBadge[tier - 1]);
                    }
                });
            }
            // Check for Star badge (level 180+) - this is awarded separately
            if (skill.level >= 180) {
                unlockedBadges.add('Star');
            }
        });
        return Array.from(unlockedBadges);
    }, [skills]);

    // Calculate unlocked achievements (memoized)
    const unlockedAchievements = React.useMemo(() => {
        const unlocked = [];
        const achievementIds = [
            'speed_demon',
            'world_ender',
            'monster_manual',
            'perfectionist',
            'full_set',
        ];

        achievementIds.forEach((id) => {
            if (isAchievementUnlocked(id, stats, skills)) {
                unlocked.push(id);
            }
        });

        return unlocked;
    }, [stats, skills]);

    // Keep challengeDataRef in sync with challengeData state for voice listener
    useEffect(() => {
        challengeDataRef.current = challengeData;
    }, [challengeData]);

    // Tell the boot loader (index.html) that the menu is ready.
    useEffect(() => {
        window.__APP_READY__?.();
    }, []);

    // Regenerate challenge when difficulty or level changes during active battle
    // This fixes the issue where challenges use stale difficulty after leveling up
    // Removed problematic useEffect that was causing infinite loop
    // The startBattle function already sets battleDifficulty correctly

    // Check for achievement unlocks
    const checkAchievements = useCallback((oldStats, newStats, oldSkills, newSkills) => {
        // Check for newly unlocked one-time achievements
        const newlyUnlocked = getNewlyUnlockedAchievements(
            oldStats,
            newStats,
            oldSkills,
            newSkills,
        );

        // Check for tiered achievement progress
        const newTiers = getNewTierAchievements(oldStats, newStats, oldSkills, newSkills);

        // Show toast for the first achievement/tier unlocked
        if (newlyUnlocked.length > 0) {
            // Show first newly unlocked achievement
            setAchievementToast({ achievementId: newlyUnlocked[0], tierIndex: null });
            playAchievement();
        } else if (newTiers.length > 0) {
            // Show first new tier
            setAchievementToast({
                achievementId: newTiers[0].achievementId,
                tierIndex: newTiers[0].tierIndex,
            });
            playAchievement();
        }
    }, []);

    const handleSuccessHit = (skillId, isWrong) => {
        // Handle wrong answer
        if (isWrong === 'WRONG') {
            // Check if player is fighting a boss
            if (battlingSkillId) {
                const currentSkillState = skills[battlingSkillId];
                const encounterType = getEncounterType(currentSkillState.level);

                // Boss fights: heal the boss instead of damaging the player
                if (encounterType === 'boss') {
                    setSkills((prev) => {
                        const current = prev[battlingSkillId];
                        return {
                            ...prev,
                            [battlingSkillId]: {
                                ...current,
                                mobHealth: current.mobMaxHealth, // Fully heal the boss
                            },
                        };
                    });

                    // Trigger boss healing animation
                    setBossHealing(battlingSkillId);
                    setTimeout(() => setBossHealing(null), BOSS_HEALING_ANIMATION_DURATION);

                    // Play fail sound to indicate mistake
                    playFail();
                    return;
                }
            }

            // Non-boss encounters: damage player
            setPlayerHealth((h) => {
                const newH = h - 1;
                if (newH <= 0) {
                    // Death sequence - play UI death sound
                    playDeath();
                    setShowDeathOverlay(true);

                    // Track death in stats
                    setStats((prevStats) => {
                        const newStats = {
                            ...prevStats,
                            totalDeaths: (prevStats.totalDeaths || 0) + 1,
                        };

                        // Check achievements after death
                        setTimeout(() => {
                            checkAchievements(prevStats, newStats, skills, skills);
                        }, 100);

                        return newStats;
                    });

                    // Reduce player level by 1 for the active skill (minimum level 1)
                    if (battlingSkillId) {
                        setSkills((prev) => {
                            const current = prev[battlingSkillId];
                            const newLevel = Math.max(1, current.level - 1);
                            const currentDiff = current.difficulty || 1;
                            return {
                                ...prev,
                                [battlingSkillId]: {
                                    ...current,
                                    level: newLevel,
                                    lostLevel: current.level > 1, // Only true if we actually lost a level
                                    recoveryDifficulty: Math.max(1, currentDiff - 1),
                                },
                            };
                        });
                    }

                    // End battle after short delay
                    setTimeout(() => {
                        setBattlingSkillId(null);
                        setShowDeathOverlay(false);
                    }, 2000);

                    return 10; // Heal to full health
                }
                // Player takes damage but doesn't die - play fail sound
                playFail();
                return newH;
            });
            return;
        }

        if (!skillId) return;
        const skillConfig = SKILL_DATA.find((s) => s.id === skillId);
        const currentSkillState = skills[skillId];
        const skillDifficulty = currentSkillState.difficulty || 1;
        const playerLevel = currentSkillState.level;
        const currentMobName = currentSkillState.currentMob;

        // Calculate damage using new RPG formulas
        const damage = calculateDamage(playerLevel, skillDifficulty);

        // Get encounter type for current level
        const encounterType = getEncounterType(playerLevel);

        // Cleaning/memory/miniboss are defeated in single hit
        const isMiniboss = encounterType === 'miniboss' && skillConfig.id !== 'cleaning';
        const isInstantDefeat =
            skillConfig.id === 'cleaning' || skillConfig.id === 'memory' || isMiniboss;
        const actualDamage = isInstantDefeat ? currentSkillState.mobHealth : damage;

        // Determine if this hit will defeat the mob
        const willDefeatMob = currentSkillState.mobHealth - actualDamage <= 0;

        // Show damage numbers and play sounds
        if (skillConfig.id !== 'memory') {
            const id = ++damageIdRef.current;
            setDamageNumbers((prev) => [
                ...prev,
                {
                    id,
                    skillId,
                    val: actualDamage,
                    x: defaultRng() * 100 - 50,
                    y: defaultRng() * 50 - 25,
                },
            ]);
            setTimeout(() => setDamageNumbers((prev) => prev.filter((n) => n.id !== id)), 800);

            // Play mob hurt or death sound based on if mob is defeated
            if (willDefeatMob) {
                playMobDeath(currentMobName);
            } else {
                playMobHurt(currentMobName);
            }

            // Play successful hit UI sound
            playSuccessfulHit();
        }

        setSkills((prev) => {
            const current = prev[skillId];
            let newMobHealth = current.mobHealth - actualDamage;
            let newLevel = current.level;
            let newXp = current.xp;
            let leveledUp = false;
            let newMob = current.currentMob;
            let newDifficulty = current.difficulty || 1;
            let newBadges = [...(current.earnedBadges || [])];
            let newMobMaxHealth = current.mobMaxHealth;
            let newLostLevel = current.lostLevel;
            let newRecoveryDifficulty = current.recoveryDifficulty;
            let newMemoryMob = current.memoryMob;
            let newPatternMob = current.patternMob;
            let newMiniboss = current.currentMiniboss;
            let newBoss = current.currentBoss;
            let newReadingMob = current.readingMob;
            let newMathMob = current.mathMob;
            let newWritingMob = current.writingMob;
            let newReadingMobAura = current.readingMobAura;
            let newMathMobAura = current.mathMobAura;
            let newWritingMobAura = current.writingMobAura;
            let newPatternMobAura = current.patternMobAura;
            let newMinibossAura = current.currentMinibossAura;
            let newBossAura = current.currentBossAura;

            // Calculate XP reward for this hit
            // Total XP is split evenly among all hits required to defeat the mob
            const totalXPReward = calculateXPReward(skillDifficulty, playerLevel);
            // For instant-defeat mobs (miniboss, cleaning, memory), actualDamage = full health, so hitsToKill = 1
            // For regular mobs, actualDamage = damage, so hitsToKill = mobMaxHealth / damage
            const effectiveDamage = isInstantDefeat ? current.mobMaxHealth : damage;
            const hitsToKill = Math.ceil(current.mobMaxHealth / effectiveDamage);
            const xpPerHit = Math.floor(totalXPReward / hitsToKill);

            // If this hit doesn't defeat the mob, award partial XP
            // If this hit defeats the mob, award any remaining XP (to account for rounding)
            const willDefeatMobInUpdate = newMobHealth <= 0;
            if (!willDefeatMobInUpdate) {
                // Award partial XP for non-killing hit
                newXp += xpPerHit;
            }

            // Mob defeated!
            if (newMobHealth <= 0) {
                // Calculate remaining XP to award (total - already awarded)
                const hitsDealt = Math.ceil(
                    (current.mobMaxHealth - current.mobHealth) / effectiveDamage,
                );
                const xpAlreadyAwarded = hitsDealt * xpPerHit;
                const remainingXP = totalXPReward - xpAlreadyAwarded;
                newXp += remainingXP;

                // Track stats for mob defeat
                const encounterType = getEncounterType(current.level);
                setStats((prevStats) => {
                    const newStats = { ...prevStats };

                    // Increment battle session counter
                    newStats.battlesThisSession = (newStats.battlesThisSession || 0) + 1;

                    if (encounterType === 'boss') {
                        // Boss defeated
                        newStats.totalBossesDefeated = (newStats.totalBossesDefeated || 0) + 1;
                        newStats.uniqueBossesDefeated = addUniqueToArray(
                            newStats.uniqueBossesDefeated || [],
                            current.currentBoss,
                        );
                    } else if (encounterType === 'miniboss') {
                        // Miniboss defeated
                        newStats.totalMinibossesDefeated =
                            (newStats.totalMinibossesDefeated || 0) + 1;
                        newStats.uniqueMinibossesDefeated = addUniqueToArray(
                            newStats.uniqueMinibossesDefeated || [],
                            current.currentMiniboss,
                        );
                    } else {
                        // Regular mob defeated
                        newStats.totalMobsDefeated = (newStats.totalMobsDefeated || 0) + 1;
                        newStats.uniqueMobsDefeated = addUniqueToArray(
                            newStats.uniqueMobsDefeated || [],
                            current.currentMob,
                        );
                    }

                    // Check achievements after stats update
                    setTimeout(() => {
                        checkAchievements(prevStats, newStats, prev, {
                            ...prev,
                            [skillId]: { ...current, level: newLevel },
                        });
                    }, 100);

                    return newStats;
                });

                // Update stable mobs for memory and patterns skills on completion
                if (skillConfig.id === 'memory') {
                    newMemoryMob = getRandomFriendlyMob();
                }
                if (skillConfig.id === 'patterns') {
                    newPatternMob = getRandomMob(current.currentMob);
                    newPatternMobAura = getRandomAura();
                }

                // Update stable mobs for combat skills on completion
                const combatSkillMobUpdates = {
                    reading: () => {
                        newReadingMob = getRandomMob(current.readingMob);
                        newReadingMobAura = getRandomAura();
                    },
                    math: () => {
                        newMathMob = getRandomMob(current.mathMob);
                        newMathMobAura = getRandomAura();
                    },
                    writing: () => {
                        newWritingMob = getRandomMob(current.writingMob);
                        newWritingMobAura = getRandomAura();
                    },
                };

                if (combatSkillMobUpdates[skillConfig.id]) {
                    combatSkillMobUpdates[skillConfig.id]();
                }

                // Update miniboss when defeating a miniboss encounter
                if (getEncounterType(current.level) === 'miniboss') {
                    newMiniboss = getRandomMiniboss();
                    newMinibossAura = getRandomAura();
                }

                // Update boss when defeating a boss encounter
                if (getEncounterType(current.level) === 'boss') {
                    newBoss = getRandomBoss();
                    newBossAura = getRandomAura();
                }

                // Check for level restoration first
                if (newLostLevel) {
                    newLevel += 1;
                    newLostLevel = false;
                    newRecoveryDifficulty = null;
                    setShowLevelRestored(true);
                    setTimeout(() => setShowLevelRestored(false), 2000);
                    playNotification();
                }

                // Process level ups - use difficulty-scaled XP requirement
                const xpToLevel = calculateXPToLevel(newDifficulty, newLevel);
                if (newXp >= xpToLevel) {
                    const levelsGained = Math.floor(newXp / xpToLevel);
                    const oldLevel = newLevel;
                    newLevel += levelsGained;
                    newXp = newXp % xpToLevel;
                    leveledUp = true;

                    // Check if we just defeated a boss (leaving a boss level)
                    // Badge/difficulty increment happens when crossing FROM a boss level (e.g., 20->21)
                    // not when arriving AT a boss level (e.g., 19->20)
                    // Cleaning is exempt from difficulty auto-increment
                    if (skillConfig.id !== 'cleaning') {
                        for (let lvl = oldLevel; lvl < newLevel; lvl++) {
                            if (lvl % 20 === 0 && lvl > 0) {
                                // Boss at level lvl was just defeated - increment difficulty (max 7)
                                const newTier = Math.floor(lvl / 20);
                                if (newDifficulty < 7) {
                                    newDifficulty++;
                                }
                                // Award badge for this tier if not already earned
                                if (!newBadges.includes(newTier) && newTier <= 7) {
                                    newBadges.push(newTier);
                                    // Show badge notification for defeating the boss
                                    setLootBox({
                                        level: lvl,
                                        skillName: skillConfig.fantasyName,
                                        item: 'New Rank!',
                                        img: BASE_ASSETS.badges.Wood,
                                    });
                                    playNotification();
                                }
                            }
                        }
                    }

                    // Get new mob if not at boss level
                    if (newLevel % 20 !== 0 && (newLevel - 1) % 20 !== 0) {
                        newMob = getRandomMob(current.currentMob);
                    }

                    if (leveledUp) {
                        playLevelUp();
                    }
                }

                // Spawn new mob with fresh health
                newMobMaxHealth = calculateMobHealth(newDifficulty);
                newMobHealth = newMobMaxHealth;
                if (newLevel % 20 !== 0) {
                    newMob = getRandomMob(current.currentMob);
                }
            }

            return {
                ...prev,
                [skillId]: {
                    ...current,
                    level: newLevel,
                    xp: newXp,
                    currentMob: newMob,
                    difficulty: newDifficulty,
                    earnedBadges: newBadges,
                    mobHealth: newMobHealth,
                    mobMaxHealth: newMobMaxHealth,
                    lostLevel: newLostLevel,
                    recoveryDifficulty: newRecoveryDifficulty,
                    memoryMob: newMemoryMob,
                    patternMob: newPatternMob,
                    currentMiniboss: newMiniboss,
                    currentBoss: newBoss,
                    readingMob: newReadingMob,
                    mathMob: newMathMob,
                    writingMob: newWritingMob,
                    readingMobAura: newReadingMobAura,
                    mathMobAura: newMathMobAura,
                    writingMobAura: newWritingMobAura,
                    patternMobAura: newPatternMobAura,
                    currentMinibossAura: newMinibossAura,
                    currentBossAura: newBossAura,
                },
            };
        });

        // Generate next challenge for continuous gameplay
        if (skillConfig.hasChallenge && skillConfig.id !== 'memory') {
            // Use the stored battle difficulty for consistent challenge generation throughout the battle
            // This ensures bosses don't change difficulty mid-fight and miniboss difficulty+1 is maintained
            const challengeDiff = battleDifficulty || skillDifficulty;
            setChallengeData(generateChallenge(skillConfig.challengeType, challengeDiff));
        } else if (skillConfig.id === 'memory') {
            setBattlingSkillId(null);
            setBattleDifficulty(null);
        }
    };

    // Helper function to set difficulty for a specific skill
    const setSkillDifficulty = (skillId, newDiff) => {
        setSkills((prev) => {
            const current = prev[skillId];
            const newMobMaxHealth = calculateMobHealth(newDiff);
            return {
                ...prev,
                [skillId]: {
                    ...current,
                    difficulty: newDiff,
                    mobHealth: newMobMaxHealth,
                    mobMaxHealth: newMobMaxHealth,
                },
            };
        });
    };

    // Wrapper for setActiveTheme to track theme changes
    const handleThemeChange = useCallback(
        (newTheme) => {
            if (newTheme !== activeTheme) {
                setActiveTheme(newTheme);
                setStats((prevStats) => {
                    const newStats = {
                        ...prevStats,
                        themeChanges: (prevStats.themeChanges || 0) + 1,
                    };

                    // Check achievements
                    setTimeout(() => {
                        checkAchievements(prevStats, newStats, skills, skills);
                    }, 100);

                    return newStats;
                });
            }
        },
        [activeTheme, skills, checkAchievements],
    );

    // Wrapper for borders.setSelectedBorder to track border changes
    const handleBorderChange = useCallback(
        (newBorder) => {
            if (newBorder !== borders.selectedBorder) {
                borders.setSelectedBorder(newBorder);
                setStats((prevStats) => {
                    const newStats = {
                        ...prevStats,
                        borderChanges: (prevStats.borderChanges || 0) + 1,
                    };

                    // Check achievements
                    setTimeout(() => {
                        checkAchievements(prevStats, newStats, skills, skills);
                    }, 100);

                    return newStats;
                });
            }
        },
        [borders.selectedBorder, borders.setSelectedBorder, skills, checkAchievements],
    );

    // Award a free level from phantom click
    const handlePhantomLevelAward = (skillId) => {
        if (!skillId) return;

        // Play level up sound
        playLevelUp();

        setSkills((prev) => {
            const current = prev[skillId];
            return {
                ...prev,
                [skillId]: {
                    ...current,
                    level: current.level + 1,
                },
            };
        });

        // Show celebration notification
        const skillConfig = SKILL_DATA.find((s) => s.id === skillId);
        if (skillConfig) {
            setLootBox({
                level: skills[skillId].level + 1,
                skillName: skillConfig.fantasyName,
                item: 'Phantom Bonus!',
                img: HOSTILE_MOBS['Phantom'],
            });
            playNotification();
        }
    };

    const startBattle = (id) => {
        const skill = SKILL_DATA.find((s) => s.id === id);
        setBattlingSkillId(id);
        // Use the skill's current difficulty setting
        const currentDiff = skills[id].difficulty || 1;
        const playerLevel = skills[id].level;

        // For miniboss encounters, use difficulty+1 for content (capped at 7)
        const encounterType = getEncounterType(playerLevel);
        const challengeDiff =
            encounterType === 'miniboss' ? Math.min(7, currentDiff + 1) : currentDiff;

        // Store the battle's challenge difficulty so it remains consistent throughout the battle
        setBattleDifficulty(challengeDiff);

        setChallengeData(generateChallenge(skill.challengeType, challengeDiff));
        playClick();
        audio.startBGM(); // Start BGM on first battle (user interaction)
        if (skill.challengeType === 'reading' && speech.isSupported)
            speech.start(id, handleSpeechResult);
    };

    const endBattle = () => {
        setBattlingSkillId(null);
        setBattleDifficulty(null);
        setChallengeData(null);
        speech.stop();
        playClick();
    };

    const handleSwitchProfile = (newId) => {
        if (newId === currentProfile) return;
        playClick();
        const newSkills = loadSkills(newId);
        const newTheme = loadTheme(newId);
        setSkills(newSkills);
        setActiveTheme(newTheme);
        setCurrentProfile(newId);
    };
    const handleRenameProfile = (id, newName) => {
        setProfileNames((prev) => ({ ...prev, [id]: newName }));
    };
    const handleParentVerified = (profileId, verified) => {
        setParentStatus((prev) => ({ ...prev, [profileId]: verified }));

        if (verified && profileId === currentProfile) {
            // When parent verification passes, apply parent privileges to all skills
            setSkills((prev) => {
                const updated = {};
                Object.keys(prev).forEach((skillId) => {
                    const current = prev[skillId];
                    updated[skillId] = {
                        ...current,
                        level: PARENT_PRIVILEGE_LEVEL,
                        difficulty: PARENT_PRIVILEGE_DIFFICULTY,
                        earnedBadges: [...PARENT_PRIVILEGE_BADGES],
                        mobHealth: calculateMobHealth(
                            PARENT_PRIVILEGE_DIFFICULTY,
                            PARENT_PRIVILEGE_LEVEL,
                        ),
                        mobMaxHealth: calculateMobHealth(
                            PARENT_PRIVILEGE_DIFFICULTY,
                            PARENT_PRIVILEGE_LEVEL,
                        ),
                    };
                });
                return updated;
            });

            // Force a re-render to ensure UI immediately reflects the new levels
            setTimeout(() => {
                setSkills((current) => ({ ...current }));
            }, 0);
        }
    };
    const handleReset = () => {
        // Remove skills data for current profile
        browserStorage.removeItem(getStorageKey(currentProfile));
        if (currentProfile === 1) browserStorage.removeItem(STORAGE_KEYS.LEGACY_SKILLS);

        // Update parent status through the storage service
        const currentParentStatus = browserStorage.getItem(STORAGE_KEYS.PARENT_STATUS);
        const parentStatusObj = currentParentStatus
            ? JSON.parse(currentParentStatus)
            : { 1: false, 2: false, 3: false };
        parentStatusObj[currentProfile] = false;
        browserStorage.setItem(STORAGE_KEYS.PARENT_STATUS, JSON.stringify(parentStatusObj));

        // Update profile name through the storage service
        const currentProfileNames = browserStorage.getItem(STORAGE_KEYS.PROFILE_NAMES);
        const profileNamesObj = currentProfileNames
            ? JSON.parse(currentProfileNames)
            : { 1: 'Player 1', 2: 'Player 2', 3: 'Player 3' };
        profileNamesObj[currentProfile] = `Player ${currentProfile}`;
        browserStorage.setItem(STORAGE_KEYS.PROFILE_NAMES, JSON.stringify(profileNamesObj));

        window.location.reload();
    };

    // Handle a recognised transcript for the current reading challenge.
    const handleSpeechResult = (text, targetId) => {
        const currentChallenge = challengeDataRef.current;
        if (!currentChallenge || currentChallenge.type !== 'reading') return;

        const expected = currentChallenge.answer;
        const isCorrect = text === expected || HOMOPHONES[expected]?.includes(text);

        if (isCorrect) {
            handleSuccessHit(targetId || battlingSkillId);
        } else if (text && text.length >= MIN_SPOKEN_TEXT_LENGTH) {
            handleSuccessHit(targetId || battlingSkillId, 'WRONG');
        }
    };

    const spokenText =
        speech.error === 'not-allowed'
            ? 'Mic permission denied'
            : !speech.isSupported
              ? 'Mic not available'
              : speech.transcript || (speech.isListening ? 'Listening...' : MIC_OFF_TEXT);

    useEffect(() => {
        if (lootBox) setTimeout(() => setLootBox(null), 4000);
    }, [lootBox]);

    // Achievement toast auto-dismiss
    useEffect(() => {
        if (achievementToast) {
            setTimeout(() => setAchievementToast(null), 6000);
        }
    }, [achievementToast]);

    // Track login date (once per day)
    useEffect(() => {
        if (loginTrackedRef.current) return; // Skip if already tracked
        loginTrackedRef.current = true;

        const today = defaultClock().toISOString().split('T')[0]; // YYYY-MM-DD format
        const currentDates = stats.loginDates || [];
        // Only set if today's date is not already recorded
        if (!currentDates.includes(today)) {
            setStats((prev) => ({
                ...prev,
                loginDates: [...(prev.loginDates || []), today],
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount, guarded by loginTrackedRef

    const currentThemeData = THEME_CONFIG[activeTheme] || THEME_CONFIG[DEFAULT_THEME_ID];
    const containerStyle = { ...currentThemeData.style, fontFamily: '"VT323", monospace' };

    return (
        <div
            className="min-h-screen overflow-hidden relative flex flex-col bg-cover bg-center bg-no-repeat font-sans text-stone-100"
            style={containerStyle}
        >
            <div className="absolute inset-0 bg-black/30 pointer-events-none z-0"></div>

            {loadWarning && <LoadWarning onDismiss={() => setLoadWarning(false)} />}

            <CornerControls
                isFullscreen={isFullscreen}
                onOpenSettings={drawers.openSettings}
                onOpenCosmetics={drawers.openCosmetics}
                onToggleFullscreen={toggleFullscreen}
                onOpenMenu={drawers.openMenu}
                onOpenBugReport={drawers.openBugReport}
            />

            <PlayerHealth health={playerHealth} />

            <DrawersLayer
                drawers={drawers}
                activeTheme={activeTheme}
                handleThemeChange={handleThemeChange}
                handleBorderChange={handleBorderChange}
                borders={borders}
                unlockedBorders={unlockedBorders}
                unlockedAchievements={unlockedAchievements}
                audio={audio}
                currentProfile={currentProfile}
                handleSwitchProfile={handleSwitchProfile}
                profileNames={profileNames}
                handleRenameProfile={handleRenameProfile}
                getProfileStats={(id, liveSkills) => getProfileStats(id, liveSkills, activeTheme)}
                parentStatus={parentStatus}
                handleParentVerified={handleParentVerified}
                skills={skills}
                stats={stats}
                handleReset={handleReset}
            />

            {/* Backdrop overlay when battling - click to exit */}
            {battlingSkillId && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        minWidth: '100vw',
                        minHeight: '100vh',
                    }}
                    onClick={endBattle}
                />
            )}
            <SkillCarousel
                carousel={carousel}
                themeData={currentThemeData}
                battlingSkillId={battlingSkillId}
                skills={skills}
                challengeData={challengeData}
                speech={speech}
                spokenText={spokenText}
                damageNumbers={damageNumbers}
                startBattle={startBattle}
                endBattle={endBattle}
                handleSuccessHit={handleSuccessHit}
                handleSpeechResult={handleSpeechResult}
                setSkillDifficulty={setSkillDifficulty}
                borders={borders}
                bossHealing={bossHealing}
                sfxPlayer={audio.sfxPlayer}
            />
            {lootBox && (
                <div className="fixed bottom-8 left-1/2 z-50 animate-toast w-full max-w-2xl pointer-events-none transform -translate-x-1/2">
                    <div className="bg-black/80 border-4 border-yellow-500 rounded-full p-4 px-12 flex items-center justify-between shadow-[0_0_30px_rgba(255,215,0,0.6)] backdrop-blur-md mx-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-yellow-500/20 p-3 rounded-full border-2 border-yellow-400">
                                <Gift size={32} className="text-yellow-300 animate-bounce" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-2xl text-yellow-400 font-bold leading-none mb-1">
                                    LEVEL {lootBox.level} REACHED!
                                </h2>
                                <p className="text-stone-300 text-sm">{lootBox.skillName}</p>
                            </div>
                        </div>
                        <div className="text-right pl-8 border-l-2 border-stone-600 flex items-center gap-4">
                            <SafeImage
                                src={lootBox.img}
                                alt="Badge"
                                className="w-12 h-12 object-contain"
                            />
                            <div>
                                <p className="text-stone-400 text-xs uppercase tracking-wider">
                                    Unlocked
                                </p>
                                <p className="text-2xl text-green-400 font-bold">{lootBox.item}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Achievement Toast */}
            {achievementToast && (
                <AchievementToast
                    achievementId={achievementToast.achievementId}
                    tierIndex={achievementToast.tierIndex}
                />
            )}

            {showDeathOverlay && <DeathOverlay />}

            {showLevelRestored && <LevelRestored />}

            {/* Phantom Fly-By Bonus Event */}
            <PhantomEvent
                battlingSkillId={battlingSkillId}
                onAwardLevel={handlePhantomLevelAward}
                onPhantomCaught={() => {
                    setStats((prevStats) => {
                        const newStats = {
                            ...prevStats,
                            phantomsCaught: (prevStats.phantomsCaught || 0) + 1,
                        };

                        // Check achievements
                        setTimeout(() => {
                            checkAchievements(prevStats, newStats, skills, skills);
                        }, 100);

                        return newStats;
                    });
                }}
            />
        </div>
    );
};

export default App;
