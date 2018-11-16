import functions from '../functions';

export default class Controller {
    constructor(userField, compField) {
        this.steps = 0;
        this.player = null;
        this.userField = userField;
        this.compField = compField;
        this.activeField = null;
        this.serviseText = functions.getElement('.battleship-btn_servise-text');
        this.username = '';
    }

    init(username) {
        self = this;
        this.username = username;
        var rnd = functions.getRandom(2);
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
        let fromX = functions.getToCoord(ship.x);
        let toX = functions.getFromCoordByAlign(ship.x, ship.kx, ship.decks);
        let fromY = functions.getToCoord(ship.y);
        let toY = functions.getFromCoordByAlign(ship.y, ship.ky, ship.decks);

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
        const temp = self.activeField.shotsList[functions.getRandom(self.activeField.shotsList.length)];
        self.activeField.shotsList = self.activeField.shotsList.filter(item => {
            return item != temp;
        })
        return temp;
    }
}