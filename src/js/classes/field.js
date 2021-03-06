import functions from '../functions';

export default class Field {

    constructor(field, player) {
        this.field = field;
        this.player = player;
        this.ships = [];
        this.size = 10;
        this.matrix = [];
        this.killedShipsCount = 0;
        this.shotsList = (player == 'user') ? this.generateShotsList(this.size) : null;
    }

    createNewField() {
        this.matrix = [this.size];
        for (let i = 0; i < this.size; i++) {
            this.matrix[i] = [this.size];
            for (let j = 0; j < this.size; j++) {
                this.matrix[i][j] = 0;
            }
        }
    }

    isAvailableCoordinats({ decks, x, y, kx, ky }) {
        let fromX = functions.getToCoord(x);
        let toX = functions.getFromCoordByAlign(x, kx, decks);
        let fromY = functions.getToCoord(y);
        let toY = functions.getFromCoordByAlign(y, ky, decks);

        for (let i = fromX; i < toX; i++) {
            for (let j = fromY; j < toY; j++) {
                if (this.matrix[j][i] != 0) {
                    return false
                }
            }
        }
        return true
    }

    addShipToField(ship) {
        this.ships.push(ship);

        for (let i = 0; i < ship.decks; i++) {
            this.matrix[ship.y + i * ship.ky][ship.x + i * ship.kx] = this.ships.length;
            ship.cordinats.push([ship.y + i * ship.ky, ship.x + i * ship.kx])
        }
    }

    getCoordinatsByDecks(decks) {
        const kx = Math.round(Math.random());
        const ky = (kx > 0) ? 0 : 1;
        const y = (ky > 0) ? functions.getRandom(10 - decks) : functions.getRandom(10);
        const x = (ky > 0) ? functions.getRandom(10) : functions.getRandom(10 - decks);
        const isAddable = this.isAvailableCoordinats({ decks, x, y, kx, ky })
        if (!isAddable) return this.getCoordinatsByDecks(decks);
        return {
            x: x,
            y: y,
            kx: kx,
            ky: ky,
            decks: decks
        }
    }

    generateShotsList(size) {
        if (!size) {
            return
        }

        const temp = [];

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                temp.push([i, j]);
            }
        }

        return temp;
    }

    drawField() {
        this.field.innerHTML = '';
        this.matrix.forEach((item, i) => {
            const row = document.createElement('div');
            row.className = 'row';
            this.field.appendChild(row);
            item.forEach((elem, j) => {
                const cell = document.createElement('div');
                if (elem > 0 && elem < 11) {
                    cell.className = (this.player == 'user') ? 'ship' : 'cell';
                } else if (elem == -1) {
                    cell.className = 'dot';
                } else if (elem == 15) {
                    cell.className = 'kill';
                } else {
                    cell.className = 'cell';

                }
                cell.dataset.rowIndex = `${i}`;
                cell.dataset.cellIndex = `${j}`;
                row.appendChild(cell);
            })
        });
    }

};