import { formatNumber } from './format-number';
import { Amount } from '@herajs/client';

const tryUnits = ['aergo', 'gaer', 'aer'];

export function formatGenericToken(value, unit = '', rawValue) {
    // insert spaces for formatting
    let display = formatNumber(value, ' ', ' ');
    // turn spaces into html to not mess up copy and paste
    display = display.replace(/\s/g, '<span class="sep"></span>');
    // add class for period
    display = display.replace('.', '<span class="point">.</span>');

    return `<span class="formatted-value token" title="${rawValue || value}"><span class="value">${display}</span> <span class="unit">${unit}</span></span>`;
}

export function formatToken(value, unit = null) {
    value = (new Amount(value, 'aer'));
    let amount;
    if (unit) {
        [amount, ] = value.toUnit(unit).toString().split(' ');
    } else {
        // if no unit given, try formatting from biggest to smallest
        let i = 0;
        while(true) {
            unit = tryUnits[i++];
            [amount, ] = value.toUnit(unit).toString().split(' ');
            if (i > 2 || !amount.match(/^0\.0{3,}/)) break;
            // try next smaller unit if too many leading zeros
        }
    }
    if (!amount) amount = '0';

    return formatGenericToken(amount, unit, value);
}

