export function getDateOfWeek(w) {
    const d = (1 + (w - 1) * 7);
    const y = new Date().getFullYear();

    return new Date(y, 0, d);
}