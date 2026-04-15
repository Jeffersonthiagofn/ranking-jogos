export function formatNumber(value) {
    return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatCompactNumber(value) {
    return new Intl.NumberFormat("pt-BR", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value || 0);
}

export function scoreToStars(score = 0) {
    return (score / 20).toFixed(1);
}

export function formatDate(value) {
    return value.replace("/", " ").replace("/", " ").replace(".", " ");
}
