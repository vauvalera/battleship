export default class Ship {
    constructor({ decks, x, y, kx, ky }) {
        this.decks = decks;
        this.x = x;
        this.y = y;
        this.kx = kx;
        this.ky = ky;
        this.hits = 0;
        this.cordinats = [];
    }

    addHit() {
        this.hits++;
    }

    isDead() {
        return this.hits == this.decks;
    }

}