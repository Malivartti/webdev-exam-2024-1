class Storage {
    static instance = null;

    constructor() {
        if (!Storage.instance) {
            Storage.instance = this;
        }
        return Storage.instance;
    }

    getItem(key) {
        const storedValue = localStorage.getItem(key);

        if (storedValue === null) {
            return null;
        }

        try {
            const parsedValue = JSON.parse(storedValue);

            if (typeof parsedValue === 'object' && parsedValue !== null) {
                return parsedValue;
            } else {
                return storedValue;
            }
        } catch (e) {
            return storedValue;
        }
    }

    setItem(key, value) {
        if (typeof value === 'object' && value !== null) {
            localStorage.setItem(key, JSON.stringify(value));
        } else {
            localStorage.setItem(key, value);
        }
    }

    removeItem(key) {
        localStorage.removeItem(key);
    }
    
    clear() {
        localStorage.clear();
    }
}

export default Storage;