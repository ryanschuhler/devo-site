export function getDateOfWeek(w: number) {
    const d = (1 + (w - 1) * 7);
    const y = new Date().getFullYear();

    return new Date(y, 0, d);
}