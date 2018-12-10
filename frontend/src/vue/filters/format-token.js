import { constants } from '@herajs/client';
import { formatNumber } from './format-number';
import JSBI from 'jsbi';

export function formatToken(value, unit = null) {
    let digits = 0;
    if (!unit) {
        unit = constants.UNITS.NATIVE_TOKEN.baseLabelShort;
        unit = 'AERGO';
        digits = constants.UNITS.NATIVE_TOKEN.baseDigits;
    }
    let display = ('' + value);
    if (value === 0 || JSBI.EQ(value, 0)) display = '0';
    else if (typeof value !== 'undefined' && digits > 0) {
        // pad to 0 . 000 000 000 000 000 100
        display = display.padStart(digits + 1, '0') 
        // insert floating point separator into string
        display = display.replace(new RegExp(`(?=\\d{${digits}}$)`), '.');
        // insert spaces for formatting
        display = formatNumber(display, ' ', ' ');
        // remove trailing groups of three 0
        display = display.replace(/\.?(\s000)+$/, '');
        // turn spaces into html to not mess up copy and paste
        display = display.replace(/\s/g, '<span class="sep"></span>');
    }
    return `<span class="formatted-value token" title="${value}"><span class="value">${display}</span> <span class="unit">${unit}</span></span>`;
}

