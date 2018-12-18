export function shortAddress(addr) {
    addr = '' + addr;
    if (!addr) return 'Contract Creation';
    if (addr.length <= 12) return addr;
    return addr.substr(0, 8) + '...' + addr.substr(addr.length-4);
}