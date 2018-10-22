import { constants } from '@herajs/client';

export function formatToken(value, unit = null) {
    let base = 1;
    let digits = 0;
    if (!unit) {
        unit = constants.UNITS.NATIVE_TOKEN.baseLabelShort;
        unit = 'AERGO';
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
    let display = (value/base).toFixed(digits);
    if (digits > 0) {
        display = display.replace(/\.?0+$/, ''); // remove trailing 0
    }
    if (value === 0) display = '0';
    return `<span class="formatted-value token" title="${value}"><span class="value">${display}</span> <span class="unit">${unit}</span></span>`;
}