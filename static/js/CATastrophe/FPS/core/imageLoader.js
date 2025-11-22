// imageLoader.js  

// imageLoader.js - Smart lazy image loading system

/**
 * ImageLoader - Manages lazy loading and caching of game images
 * Only loads images when needed to improve performance and load times
 */
export class ImageLoader {
    constructor(baseUrl = '/static/') {
        this.baseUrl = baseUrl;
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    /**
     * Load a single image
     * @param {string} path - Relative path to the image
     * @returns {Promise<HTMLImageElement>} - Loaded image element
     */
    async load(path) {
        // Return cached image if already loaded
        if (this.cache.has(path)) {
            return this.cache.get(path);
        }

        // Return existing promise if already loading
        if (this.loadingPromises.has(path)) {
            return this.loadingPromises.get(path);
        }

        // Create new loading promise
        const loadPromise = new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.cache.set(path, img);
                this.loadingPromises.delete(path);
                this.loadedCount++;
                console.log(`✅ Loaded: ${path} (${this.loadedCount}/${this.totalCount})`);
                resolve(img);
            };

            img.onerror = () => {
                this.loadingPromises.delete(path);
                console.error(`❌ Failed to load: ${path}`);
                reject(new Error(`Failed to load image: ${path}`));
            };

            img.src = this.baseUrl + path;
        });

        this.loadingPromises.set(path, loadPromise);
        this.totalCount++;
        
        return loadPromise;
    }

    /**
     * Load multiple images in parallel
     * @param {string[]} paths - Array of image paths
     * @returns {Promise<HTMLImageElement[]>} - Array of loaded images
     */
    async loadBatch(paths) {
        console.log(`📦 Loading batch of ${paths.length} images...`);
        return Promise.all(paths.map(path => this.load(path)));
    }

    /**
     * Load images with progress callback
     * @param {string[]} paths - Array of image paths
     * @param {Function} onProgress - Callback function (loaded, total) => void
     * @returns {Promise<HTMLImageElement[]>}
     */
    async loadBatchWithProgress(paths, onProgress) {
        const total = paths.length;
        let loaded = 0;

        const promises = paths.map(async (path) => {
            const img = await this.load(path);
            loaded++;
            if (onProgress) {
                onProgress(loaded, total);
            }
            return img;
        });

        return Promise.all(promises);
    }

    /**
     * Get cached image (returns null if not loaded)
     * @param {string} path - Image path
     * @returns {HTMLImageElement|null}
     */
    get(path) {
        return this.cache.get(path) || null;
    }

    /**
     * Check if image is loaded
     * @param {string} path - Image path
     * @returns {boolean}
     */
    isLoaded(path) {
        return this.cache.has(path);
    }

    /**
     * Check if image is currently loading
     * @param {string} path - Image path
     * @returns {boolean}
     */
    isLoading(path) {
        return this.loadingPromises.has(path);
    }

    /**
     * Preload character selection images
     * Only loads small images for all cats
     * @param {Array} characters - Array of character configs
     * @returns {Promise<void>}
     */
    async loadCharacterSelectImages(characters) {
        console.log('🐱 Loading character selection images...');
        const paths = characters.map(char => char.sprites.small);
        await this.loadBatch(paths);
        console.log('✅ Character selection images loaded!');
    }

    /**
     * Load full character sprites for selected character
     * Loads walk, jump, stand animations
     * @param {Object} character - Character config
     * @returns {Promise<void>}
     */
    async loadCharacterSprites(character) {
        console.log(`🐱 Loading sprites for ${character.name}...`);
        const paths = [
            character.sprites.big,
            character.sprites.idle,
            character.sprites.walk,
            character.sprites.jump,
            character.sprites.stand
        ];
        await this.loadBatch(paths);
        console.log(`✅ ${character.name} sprites loaded!`);
    }

    /**
     * Load level-specific images
     * @param {Object} level - Level config
     * @returns {Promise<void>}
     */
    async loadLevelImages(level) {
        console.log(`🎮 Loading Level ${level.id} images...`);
        const paths = [level.background];

        // Load cup sprite if level has cups
        if (level.cups && level.cups.enabled) {
            paths.push('images/CATastrophe/Enemies/Cup.png');
        }

        // Load enemy sprites if level has enemies
        if (level.enemies && level.enemies.type) {
            paths.push(level.enemies.sprite);
        }

        await this.loadBatch(paths);
        console.log(`✅ Level ${level.id} images loaded!`);
    }

    /**
     * Load boss battle images
     * @param {Object} boss - Boss config
     * @returns {Promise<void>}
     */
    async loadBossImages(boss) {
        console.log(`👹 Loading boss images for ${boss.name}...`);
        const paths = [
            boss.sprite,
            boss.background
        ];
        await this.loadBatch(paths);
        console.log(`✅ Boss images loaded!`);
    }

    /**
     * Load menu/UI images
     * @returns {Promise<void>}
     */
    async loadMenuImages() {
        console.log('📋 Loading menu images...');
        const paths = [
            'images/CATastrophe/Backgrounds/MenuBG3.png',
            'images/CATastrophe/Backgrounds/BattleBG.png'
        ];
        await this.loadBatch(paths);
        console.log('✅ Menu images loaded!');
    }

    /**
     * Clear specific images from cache (for memory management)
     * @param {string[]} paths - Array of paths to clear
     */
    unload(paths) {
        paths.forEach(path => {
            if (this.cache.has(path)) {
                this.cache.delete(path);
                console.log(`🗑️ Unloaded: ${path}`);
            }
        });
    }

    /**
     * Clear all images from cache
     */
    clearCache() {
        console.log('🗑️ Clearing image cache...');
        this.cache.clear();
        this.loadingPromises.clear();
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getStats() {
        return {
            cached: this.cache.size,
            loading: this.loadingPromises.size,
            loaded: this.loadedCount,
            total: this.totalCount
        };
    }
}

/**
 * Create and export a singleton instance
 */
export const imageLoader = new ImageLoader();

/**
 * Helper function to create image element from cached image
 * @param {string} path - Image path
 * @returns {HTMLImageElement|null}
 */
export function getCachedImage(path) {
    return imageLoader.get(path);
}

/**
 * Preload sequence for game start
 * Only loads menu images initially
 */
export async function preloadInitialAssets() {
    console.log('🚀 Preloading initial assets...');
    await imageLoader.loadMenuImages();
    console.log('✅ Initial assets loaded!');
}