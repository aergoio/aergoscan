
const MINIMUM_LOAD_TIME = 500; // miliseconds

const clamp = function(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

/**
 * A UX hack to wait a minimum amount of time when API responds very quickly.
 * Also good for testing, as production load times are usually faster than
 * in a development environment.
 * @return {loadAndWait~waitMinimum}
 */
function loadAndWait(minimumLoadTime = MINIMUM_LOAD_TIME) {
    const startedLoading = + new Date();
    /**
     * @return {Promise} promise that resolves when minimumLoadTime minus wait time has passed (possible immediately).
     */
    return function waitMinimum() {
        return new Promise(resolve => {
            const loadDuration = startedLoading - new Date();
            const waitTime = clamp(minimumLoadTime-loadDuration, 0, minimumLoadTime);
            setTimeout(resolve, waitTime);
        });
    }
}

export {
    loadAndWait
}