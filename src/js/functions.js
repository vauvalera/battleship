const getElement = (name) => {
    return document.querySelector(name);
}

const getRandom = (n) => {
    return Math.floor(Math.random() * (n));
}

const getFromCoordByAlign = (coord, align, ship) => {
    if (coord + align * ship <= 9 && align == 1) {
        return coord + align * ship + 1;
    }
    if (coord + align * ship == 9 && align == 1) {
        return coord + align * ship;
    }
    if (coord == 9 && align == 0) {
        return coord + 1;
    }
    if (coord < 9 && align == 0) {
        return coord + 2;
    }
}

const getToCoord = (coord) => {
    return (coord > 0) ? coord - 1 : coord;
}

export default {
    getElement,
    getRandom,
    getFromCoordByAlign,
    getToCoord
}