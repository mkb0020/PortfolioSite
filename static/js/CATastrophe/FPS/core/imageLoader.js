// imageLoader.js  
 //MANAGES LAZY LOADING AND CACHING GAME IMAGES - ONLY LOADS OMAGES AS NEEDED 
 export class ImageLoader {
    constructor(baseUrl = '/static/') {
        this.baseUrl = baseUrl;
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    /**
     * LOAD A SINGLE IMAGE 
     * @param {string} path - RELATIVE PATH TO IMAGE
     * @returns {Promise<HTMLImageElement>} - LOADED IMAGE ELEMENT
     */
    async load(path) {
        if (this.cache.has(path)) { // RETURN CACHED IMAGE IF ALRADY LOADED
            return this.cache.get(path);
        }

        if (this.loadingPromises.has(path)) { // RETURN EXISTING PROMISE IF ALREADY LOADING
            return this.loadingPromises.get(path);
        }

        const loadPromise = new Promise((resolve, reject) => { // CREATE NEW LOADING PROMISE
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
     *  LOAD MULTIPLE IMAGES IN PARALLEL
     * @param {string[]} paths - ARRAY OF IMAGE PATHS
     * @returns {Promise<HTMLImageElement[]>} -  ARRAY OF LOADED IMAGES
     */
    async loadBatch(paths) {
        console.log(`📦 Loading batch of ${paths.length} images...`);
        return Promise.all(paths.map(path => this.load(path)));
    }

    /**
     *  LOAD IMAGES WITH PROGRESS  CALLBACK
     * @param {string[]} paths -  ARRAY OF IMAGE PATHS
     * @param {Function} onProgress - CALLBACK FUNCTION (LOADED TOTAL) => VOID
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
     * @param {string} path - Image path IMAGE PATH  TO GET CACHED IMAGE (RETURNS NULL IF NOT LOADED)
     * @returns {HTMLImageElement|null}
     */
    get(path) {
        return this.cache.get(path) || null;
    }

    /**
     * CHECK IF IMAGE IS LOADED
     * @param {string} path - IMAGE PATH
     * @returns {boolean}
     */
    isLoaded(path) {
        return this.cache.has(path);
    }

    /**
     *  CHECK IF IMAGE IS CURRENTLY LOADING
     * @param {string} path - IMAGE PATH
     * @returns {boolean}
     */
    isLoading(path) {
        return this.loadingPromises.has(path);
    }

    /**
     *  PRELOAD CHARACTER SELECTION IMAGES
     *  ONLY LOAD SMALL IMAGES FOR ALL CATS
     * @param {Array} characters - ARRAY OF CHARACTER CONFIGS
     * @returns {Promise<void>}
     */
    async loadCharacterSelectImages(characters) {
        console.log('🐱 Loading character selection images...');
        const paths = characters.map(char => char.sprites.small);
        await this.loadBatch(paths);
        console.log('✅ Character selection images loaded!');
    }

    /**
     *  LOAD FULL CHARACTER SPRITES FOR SELECTED CHARACTER - WALK, JUMP AND STAND
     * @param {Object} character - CHARACTER CONFIG
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
     * LOAD LEVEL SPECIFIC IMAGES
     * @param {Object} level -  LEVEL CONFIG
     * @returns {Promise<void>}
     */
    async loadLevelImages(level) {
        console.log(`🎮 Loading Level ${level.id} images...`);
        const paths = [level.background];

        if (level.cups && level.cups.enabled) { // LOAD CUP SPRITE IF LEVEL HAS CUPS
            paths.push('images/CATastrophe/Enemies/Cup.png');
        }

        if (level.enemies && level.enemies.type) { // LOAD ENEMY SPRITES IF LEVEL HAS ENEMIES
            paths.push(level.enemies.sprite);
        }

        await this.loadBatch(paths);
        console.log(`✅ Level ${level.id} images loaded!`);
    }

    /**
     * LOAD BOSS BATTLE IMAGES
     * @param {Object} boss - BOSS CONFIG
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
     * LOAD MENU / UI IMAGES
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
     * CLEAR SPECIFIC IMAGES FROM CACHE
     * @param {string[]} paths - ARRAAY OF PATHS TO CLEAR
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
     *  CLEAR AL IMAGES FROM CACHE
     */
    clearCache() {
        console.log('🗑️ Clearing image cache...');
        this.cache.clear();
        this.loadingPromises.clear();
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    /**
     *  GET CACHE CHARACTERISTICS
     * @returns {Object}  CACHE STATS
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
 * CREATE AND EXPORT A SINGLETON INSTANCE
 */
export const imageLoader = new ImageLoader();

/**
 *  HELPER FUNCTION TO CREATE IMAGE ELEMENT FROM CACHED IMAGE
 * @param {string} path - Image path
 * @returns {HTMLImageElement|null}
 */
export function getCachedImage(path) {
    return imageLoader.get(path);
}

/**
 * PRELOAD SEQUENCE FOR GAME START
 *  ONLY LOAD MENU IMAGE INSTANTLY
 */
export async function preloadInitialAssets() {
    console.log('🚀 Preloading initial assets...');
    await imageLoader.loadMenuImages();
    console.log('✅ Initial assets loaded!');
}