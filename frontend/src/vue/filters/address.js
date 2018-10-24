export function shortAddress(addr) {
    if (!addr) return 'Contract Creation';
    return addr.substr(0, 8) + '...' + addr.substr(addr.length-4);
}