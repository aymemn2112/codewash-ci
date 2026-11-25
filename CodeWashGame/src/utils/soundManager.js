/**
 * Sound Manager Utility
 * Centralized sound management for the game including BGM shuffle, UI sounds, and mob sounds.
 */

import { defaultRng } from '../services/rng';

// Fabrique d'éléments audio, injectable pour isoler les tests du navigateur.
const defaultAudioFactory = (src) => new Audio(src);

// BGM tracks discovered from public/assets/sounds/bgm/
const BGM_TRACKS = [
    'assets/sounds/bgm/calm1.wav',
    'assets/sounds/bgm/calm2.wav',
    'assets/sounds/bgm/calm3.wav',
    'assets/sounds/bgm/piano1.wav',
    'assets/sounds/bgm/piano2.wav',
    'assets/sounds/bgm/piano3.wav',
];

// UI sound paths
const UI_SOUNDS = {
    actioncard_left: 'assets/sounds/ui/actioncard_left.wav',
    actioncard_right: 'assets/sounds/ui/actioncard_right.wav',
    click: 'assets/sounds/ui/click.wav',
    death: 'assets/sounds/ui/death.wav',
    fail: 'assets/sounds/ui/fail.wav',
    levelup: 'assets/sounds/ui/levelup.wav',
    notification: 'assets/sounds/ui/notification.wav',
    successful_hit: 'assets/sounds/ui/successful_hit.wav',
};

// Mob name to folder name mapping (handles differences between display names and folder names)
const MOB_FOLDER_MAP = {
    // Hostile mobs
    Zombie: 'zombie',
    Creeper: 'creeper',
    Skeleton: 'skeleton',
    Spider: 'spider',
    Enderman: 'endermen',
    Blaze: 'blaze',
    Ghast: 'ghast',
    Slime: 'slime',
    Phantom: 'phantom',
    Piglin: 'piglin',
    Hoglin: 'hoglin',
    Drowned: 'drowned',
    Pillager: 'pillager',
    Evoker: 'evoker',
    Guardian: 'guardian',
    'Magma Cube': 'magmacube',
    Witch: 'witch',
    // Boss mobs
    'Ender Dragon': 'enderdragon',
    Wither: 'wither',
    Warden: 'warden',
    // Miniboss mobs
    'Elder Guardian': 'elderguardian',
    Ravager: 'ravager',
    'Wither Skeleton': 'wither_skeleton',
    Creaking: 'creaking',
    // Friendly mobs
    Cat: 'cat',
    Chicken: 'chicken',
    Cow: 'cow',
    Pig: 'pig',
    Sheep: 'sheep',
    Wolf: 'wolf',
    Dolphin: 'dolphin',
    Fox: 'fox',
    Panda: 'panda',
    Parrot: 'parrot',
    Horse: 'horse',
    Turtle: 'turtle',
    Rabbit: 'rabbit',
    Bunny: 'rabbit',
    Mooshroom: 'mooshroom',
    'Polar Bear': 'polarbear',
    Llama: 'llama',
    Bat: 'bat',
    Bee: 'bee',
    Villager: 'villager',
    'Iron Golem': 'irongolem',
    'Wandering Trader': 'wandering_trader',
    Strider: 'strider',
};

// Class for managing BGM playback with shuffle
class BGMManager {
    constructor({ audioFactory = defaultAudioFactory } = {}) {
        this.audioFactory = audioFactory;
        this.audio = null;
        this.volume = 0.3;
        this.isPlaying = false;
        this.currentTrackIndex = -1;
        this.tracks = [...BGM_TRACKS];
    }

    setVolume(vol) {
        this.volume = vol;
        if (this.audio) {
            this.audio.volume = vol;
        }
    }

    getRandomTrack(rng = defaultRng) {
        // Get a random track that's different from the current one
        const availableIndices = this.tracks
            .map((_, i) => i)
            .filter((i) => i !== this.currentTrackIndex);

        // If only one track or no other tracks available, return current
        if (availableIndices.length === 0) {
            return this.currentTrackIndex >= 0 ? this.currentTrackIndex : 0;
        }

        const randomIndex = Math.floor(rng() * availableIndices.length);
        return availableIndices[randomIndex];
    }

    play() {
        if (!this.audio) {
            this.currentTrackIndex = this.getRandomTrack();
            this.audio = this.audioFactory(this.tracks[this.currentTrackIndex]);
            this.audio.volume = this.volume;

            // When a track ends, play a new random track
            this.audio.addEventListener('ended', () => {
                this.playNextTrack();
            });
        }

        this.audio.play().catch(() => {});
        this.isPlaying = true;
    }

    playNextTrack() {
        this.currentTrackIndex = this.getRandomTrack();
        if (this.audio) {
            this.audio.src = this.tracks[this.currentTrackIndex];
            this.audio.volume = this.volume; // Ensure volume is set for new track
            this.audio.play().catch(() => {});
        }
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
            this.isPlaying = false;
        }
    }

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
}

// Fabrique explicite : chaque appel renvoie un manager indépendant.
export const createBGMManager = (options = {}) => new BGMManager(options);

// Conservé pour les appelants existants, mais sans état global mutable.
export const getBGMManager = () => createBGMManager();

// SFX player: volume is held by the instance, never in a module-level variable.
// Passing a bare audio factory is still supported for backwards compatibility.
export const createSfxPlayer = ({ volume = 0.5, audioFactory = defaultAudioFactory } = {}) => {
    let currentVolume = volume;

    return {
        setVolume: (vol) => {
            currentVolume = vol;
        },
        getVolume: () => currentVolume,
        create: (src) => {
            const audio = audioFactory(src);
            audio.volume = currentVolume;
            return audio;
        },
        play: (src) => {
            const audio = audioFactory(src);
            audio.volume = currentVolume;
            return audio.play().catch(() => {});
        },
    };
};

const resolveSfxPlayer = (playerOrFactory) =>
    typeof playerOrFactory === 'function'
        ? createSfxPlayer({ audioFactory: playerOrFactory })
        : playerOrFactory || createSfxPlayer();

/**
 * Play a UI sound
 * @param {string} soundName - Name of the UI sound (click, death, fail, levelup, etc.)
 * @param {object|Function} [playerOrFactory] - Sfx player or legacy audio factory
 */
export const playUISound = (soundName, playerOrFactory) => {
    const path = UI_SOUNDS[soundName];
    if (!path) return;

    resolveSfxPlayer(playerOrFactory).play(path);
};

/**
 * Play actioncard left sound
 */
export const playActionCardLeft = (player) => playUISound('actioncard_left', player);

/**
 * Play actioncard right sound
 */
export const playActionCardRight = (player) => playUISound('actioncard_right', player);

/**
 * Play click sound
 */
export const playClick = (player) => playUISound('click', player);

/**
 * Play death sound (player death)
 */
export const playDeath = (player) => playUISound('death', player);

/**
 * Play fail sound (player takes damage but doesn't die)
 */
export const playFail = (player) => playUISound('fail', player);

/**
 * Play level up sound
 */
export const playLevelUp = (player) => playUISound('levelup', player);

/**
 * Play notification sound
 */
export const playNotification = (player) => playUISound('notification', player);

/**
 * Play successful hit sound
 */
export const playSuccessfulHit = (player) => playUISound('successful_hit', player);

/**
 * Play achievement unlock sound
 * Uses the notification sound for achievement unlocks
 */
export const playAchievement = (player) => playUISound('notification', player);

/**
 * Get the folder name for a mob
 * @param {string} mobName - Display name of the mob
 * @returns {string|null} - Folder name or null if not found/mapped
 */
const getMobFolder = (mobName) => {
    // Only use explicit mappings to avoid loading non-existent files
    return MOB_FOLDER_MAP[mobName] || null;
};

/**
 * Play mob hurt sound
 * @param {string} mobName - Display name of the mob
 */
export const playMobHurt = (mobName, playerOrFactory) => {
    const folder = getMobFolder(mobName);
    if (!folder) return;

    // Use standardized naming (all files renamed to hurt.wav)
    resolveSfxPlayer(playerOrFactory).play(`assets/sounds/mob/${folder}/hurt.wav`);
};

/**
 * Play mob death sound
 * @param {string} mobName - Display name of the mob
 */
export const playMobDeath = (mobName, playerOrFactory) => {
    const folder = getMobFolder(mobName);
    if (!folder) return;

    // Use standardized naming (all files renamed to death.wav)
    resolveSfxPlayer(playerOrFactory).play(`assets/sounds/mob/${folder}/death.wav`);
};

/**
 * Play mob say sound (for friendly mobs)
 * @param {string} mobName - Display name of the mob
 */
export const playMobSay = (mobName, playerOrFactory) => {
    const folder = getMobFolder(mobName);
    if (!folder) return;

    // Use standardized naming (all files renamed to say.wav)
    resolveSfxPlayer(playerOrFactory).play(`assets/sounds/mob/${folder}/say.wav`);
};

// Export UI sound names for reference
export const UI_SOUND_NAMES = Object.keys(UI_SOUNDS);
