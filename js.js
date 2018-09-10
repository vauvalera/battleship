class Field {

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
        let fromX = getToCoord(x);
        let toX = getFromCoordByAlign(x, kx, decks);
        let fromY = getToCoord(y);
        let toY = getFromCoordByAlign(y, ky, decks);

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
        const y = (ky > 0) ? getRandom(10 - decks) : getRandom(10);
        const x = (ky > 0) ? getRandom(10) : getRandom(10 - decks);
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
                temp.push([i,j]);
            }
        }

        return temp;
    }

    drawField () {
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

}

class Ship { 
    constructor({ decks, x, y, kx, ky }) {
        this.decks = decks;
        this.x = x;
        this.y = y;
        this.kx = kx;
        this.ky = ky;
        this.hits = 0;
        this.cordinats = [];
    }

    addHit () {
        this.hits++;
    }

    isDead() {
        return this.hits == this.decks;
    }

}

class Controller {
    constructor(userField, compField) {
        this.steps = 0;
        this.player = null;
        this.userField = userField;
        this.compField = compField;
        this.activeField = null;
        this.serviseText = getElement('.battleship-btn_servise-text');
        this.username = '';
    }

    init(username) {
        // console.log('START');
        self = this;
        this.username = username;
        var rnd = getRandom(2);
        self.player = (rnd == 0) ? 'user' : 'comp';
        if (self.player === 'user') {
            self.compField.field.addEventListener('click', self.shoot);
            self.activeField = self.compField;
            self.showServiseText('Вы стреляете первым.');
        } else {
            self.activeField = self.userField;
            self.showServiseText('Первым стреляет компьютер.');
            self.nextShot();
        }
    }
    
    shoot(e) {
        let x, y;
        if (e !== undefined) {
            x = e.target.dataset.cellIndex;
            y = e.target.dataset.rowIndex;
        } else {
            [y, x] = self.getCoordinatesShot();
        }
        if (x == undefined || y == undefined) {
            self.showServiseText((self.player == 'user') ? `${self.username}, Вы попали в решетку, повторите выстрел.` : '');
            self.nextShot();
            return;
        }
        switch (self.activeField.matrix[y][x]) {
            case 0:
                self.setMissedShot(x, y);
                self.activeField.drawField();
                self.showServiseText((self.player == 'user') ? `${self.username}, Вы промахнулись. Ходит комьютер` : 'Компьютер промахнулся. Ваш ход.');
                self.changePlayer();
                self.changeActiveField();
                self.nextShot();
                break;
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                const ship = self.getShipByMatrixCoordinats(x, y);
                ship.addHit();
                if (ship.isDead()) {
                    self.surroundShip(ship);
                    self.increaseKilledShips();
                }
                self.setHittedShot(x, y);
                self.activeField.drawField();
                if (self.isEndOfGame()) {
                    self.showServiseText((self.player == 'user') ? `Вы выйграли, ${self.username}!` : 'Компьютер выйграл!');
                    self.compField.field.removeEventListener('click', self.shoot);
                    return;
                }
                self.showServiseText((self.player == 'user') ? `${self.username}, Вы попали в корабль!` : 'Компьютер попал, ходит еще раз!');
                self.nextShot();
                break;
            default:
                if (self.player == 'comp') {
                    setTimeout(function () {
                        return self.shoot();
                    }, 1000);
                } else {
                    self.showServiseText('В данную клетку стрелять нельзя. Выберите другую!');
                }
                break;
        }
    }
    
    changeActiveField() {
        this.activeField = (this.player == 'comp') ? this.userField : this.compField;
    }
    
    changePlayer() {
        this.player = (this.player == 'comp') ? 'user' : 'comp';
    }

    nextShot() {
        if (self.player == 'comp') {
            self.compField.field.removeEventListener('click', self.shoot);
            self.compShot();
        } else {
            self.activeField.field.addEventListener('click', self.shoot);
        }
    }

    compShot() {
        setTimeout(function () {
            self.shoot();
        }, 500);
    }

    setMissedShot(x, y) {
        self.activeField.matrix[y][x] = -1;
    }

    getShipByMatrixCoordinats(x, y) {
        return self.activeField.ships[self.activeField.matrix[y][x] - 1];
    }

    setHittedShot(x, y) {
        self.activeField.matrix[y][x] = 15;
    }

    showServiseText(text) {
        this.serviseText.innerHTML = text;
    }

    surroundShip(ship) {
        let fromX = getToCoord(ship.x);
        let toX = getFromCoordByAlign(ship.x, ship.kx, ship.decks);
        let fromY = getToCoord(ship.y);
        let toY = getFromCoordByAlign(ship.y, ship.ky, ship.decks);

        for (let i = fromX; i < toX; i++) {
            for (let j = fromY; j < toY; j++) {
                if (self.activeField.matrix[j][i] == 0) {
                    self.activeField.matrix[j][i] = -1;
                }
            }
        }
    }

    increaseKilledShips() {
        self.activeField.killedShipsCount++;
    }

    isEndOfGame() {
        return (self.activeField.killedShipsCount == 10) ? true : false;
    }

    getCoordinatesShot() {
        const temp = self.activeField.shotsList[getRandom(self.activeField.shotsList.length)];
        self.activeField.shotsList = self.activeField.shotsList.filter(item => {
            return item != temp;
        })
        return temp;
    }
}

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
    if  (coord == 9 && align == 0) {
        return coord + 1;
    }
    if (coord < 9 && align == 0) {
        return coord + 2;
    }
}

const getToCoord = (coord) => {
    return (coord > 0) ? coord - 1 : coord;
}

getElement('.battleship-btn_start').addEventListener('click', (e)  => {

    const allShips = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

    const fieldUser = getElement('.battleship-field-user');
    let userField = fieldUser && (new Field(fieldUser, 'user'));
    userField.createNewField();


    const fieldComp = getElement('.battleship-field-computer');
    let compField = fieldComp && (new Field(fieldComp, 'comp'));
    compField.createNewField();

    allShips.forEach(decks => {
        const shipInfo = userField.getCoordinatsByDecks(decks);
        const ship = new Ship(shipInfo);
        userField.addShipToField(ship);

        const shipInfo2 = compField.getCoordinatsByDecks(decks);
        const ship2 = new Ship(shipInfo2);
        compField.addShipToField(ship2);
    })

    userField.drawField();
    compField.drawField();

    userField.field.style.display = 'block';
    compField.field.style.display = 'block';

    getElement('.battleship-btn_play').setAttribute('hidden', true);
    getElement('.battleship-btn_title').setAttribute('hidden', true);

    const username = getElement('.battleship-user-name').value;

    getElement('#battleship-form').style.display = 'none';
    getElement('.battleship-overlay').style.display = 'none';
    
    const controller = new Controller(userField, compField);
    controller.init(username);
    e.preventDefault();
});

getElement('#play').addEventListener('click', e => {
    getElement('#battleship-form').style.display ='block';
    getElement('.battleship-overlay').style.display ='block';
});

