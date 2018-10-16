import { constants } from 'herajs';

export function formatToken(value, unit = null) {
    let base = 1;
    let digits = 0;
    if (!unit) {
        unit = constants.UNITS.NATIVE_TOKEN.baseLabelShort;
        digits = constants.UNITS.NATIVE_TOKEN.baseDigits;
        base = Math.pow(10, digits);
        /*
        if (constants.UNITS.NATIVE_TOKEN.subUnits) {
            for (let subUnit of constants.UNITS.NATIVE_TOKEN.subUnits) {
                const base = Math.pow(10, subUnit.e);
                if (value > base / 100000) {
                    unit = subUnit.label;
                    value = value / base;
                }
            }
        }
        */
    }
    return `<span class="formatted-value token" title="${value}"><span class="value">${(value/base).toFixed(digits)}</span> <span class="unit">${unit}</span></span>`;
}