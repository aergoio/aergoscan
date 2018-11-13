
const MINIMUM_LOAD_TIME = 500; // miliseconds

const clamp = function(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

/**
 * A UX hack to wait a minimum amount of time when API responds very quickly.
 * Also good for testing, as production load times are usually slower than
 * in a development environment.
 * 
 * Example:
 *     const waitMinimum = loadAndWait();
 *     (... do something that the user expects to take some time, e.g. loading data ...)
 *     await waitMinimum();
 * 
 * @return {loadAndWait~waitMinimum}
 */
function loadAndWait(minimumLoadTime = MINIMUM_LOAD_TIME) {
    const startedLoading = + new Date();
    /**
     * @return {Promise} promise that resolves when minimumLoadTime minus wait time has passed (possibly immediately).
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