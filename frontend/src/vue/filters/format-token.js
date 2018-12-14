import { formatNumber } from './format-number';
import { Amount } from '@herajs/client';

export function formatToken(value, unit = null) {
    if (!unit) {
        unit = 'aergo';
    }
    let [amount, ] = (new Amount(value, 'aer')).toUnit(unit).toString().split(' ');

    if (!amount) amount = '0';

    // insert spaces for formatting
    let display = formatNumber(amount, ' ', ' ');
    // turn spaces into html to not mess up copy and paste
    display = display.replace(/\s/g, '<span class="sep"></span>');
    // add class for period
    display = display.replace('.', '<span class="point">.</span>');

    return `<span class="formatted-value token" title="${value}"><span class="value">${display}</span> <span class="unit">${unit}</span></span>`;
}

