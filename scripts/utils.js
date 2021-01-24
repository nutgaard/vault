function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function decapitalize(value) {
    return value.charAt(0).toLowerCase() + value.slice(1);
}

function snakecase(value) {
    return value.replaceAll('-', '_');
}

function pascalcase(value) {
    return value
        .split(/[-_]/)
        .map(capitalize)
        .join('');
}

function camelcase(value) {
    return decapitalize(pascalcase(value));
}

module.exports = {
    decapitalize,
    capitalize,
    snakecase,
    camelcase,
    pascalcase
}
