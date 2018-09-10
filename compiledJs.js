"use strict";

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var Field = (function () {
    function Field(field, player) {
        _classCallCheck(this, Field);

        this.field = field;
        this.player = player;
        this.ships = [];
        this.size = 10;
        this.matrix = [];
        this.killedShipsCount = 0;
        this.shotsList =
            player == "user" ? this.generateShotsList(this.size) : null;
    }

    Field.prototype.createNewField = function createNewField() {
        this.matrix = [this.size];
        for (var i = 0; i < this.size; i++) {
            this.matrix[i] = [this.size];
            for (var j = 0; j < this.size; j++) {
                this.matrix[i][j] = 0;
            }
        }
    };

    Field.prototype.isAvailableCoordinats = function isAvailableCoordinats(_ref) {
        var decks = _ref.decks,
            x = _ref.x,
            y = _ref.y,
            kx = _ref.kx,
            ky = _ref.ky;

        var fromX = getToCoord(x);
        var toX = getFromCoordByAlign(x, kx, decks);
        var fromY = getToCoord(y);
        var toY = getFromCoordByAlign(y, ky, decks);

        for (var i = fromX; i < toX; i++) {
            for (var j = fromY; j < toY; j++) {
                if (this.matrix[j][i] != 0) {
                    return false;
                }
            }
        }
        return true;
    };

    Field.prototype.addShipToField = function addShipToField(ship) {
        this.ships.push(ship);

        for (var i = 0; i < ship.decks; i++) {
            this.matrix[ship.y + i * ship.ky][
                ship.x + i * ship.kx
            ] = this.ships.length;
            ship.cordinats.push([ship.y + i * ship.ky, ship.x + i * ship.kx]);
        }
    };

    Field.prototype.getCoordinatsByDecks = function getCoordinatsByDecks(decks) {
        var kx = Math.round(Math.random());
        var ky = kx > 0 ? 0 : 1;
        var y = ky > 0 ? getRandom(10 - decks) : getRandom(10);
        var x = ky > 0 ? getRandom(10) : getRandom(10 - decks);
        var isAddable = this.isAvailableCoordinats({
            decks: decks,
            x: x,
            y: y,
            kx: kx,
            ky: ky
        });
        if (!isAddable) return this.getCoordinatsByDecks(decks);
        return {
            x: x,
            y: y,
            kx: kx,
            ky: ky,
            decks: decks
        };
    };

    Field.prototype.generateShotsList = function generateShotsList(size) {
        if (!size) {
            return;
        }

        var temp = [];

        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                temp.push([i, j]);
            }
        }

        return temp;
    };

    Field.prototype.drawField = function drawField() {
        var _this = this;

        this.field.innerHTML = "";
        this.matrix.forEach(function (item, i) {
            var row = document.createElement("div");
            row.className = "row";
            _this.field.appendChild(row);
            item.forEach(function (elem, j) {
                var cell = document.createElement("div");
                if (elem > 0 && elem < 11) {
                    cell.className = _this.player == "user" ? "ship" : "cell";
                } else if (elem == -1) {
                    cell.className = "dot";
                } else if (elem == 15) {
                    cell.className = "kill";
                } else {
                    cell.className = "cell";
                }
                cell.dataset.rowIndex = "" + i;
                cell.dataset.cellIndex = "" + j;
                row.appendChild(cell);
            });
        });
    };

    return Field;
})();

var Ship = (function () {
    function Ship(_ref2) {
        var decks = _ref2.decks,
            x = _ref2.x,
            y = _ref2.y,
            kx = _ref2.kx,
            ky = _ref2.ky;

        _classCallCheck(this, Ship);

        this.decks = decks;
        this.x = x;
        this.y = y;
        this.kx = kx;
        this.ky = ky;
        this.hits = 0;
        this.cordinats = [];
    }

    Ship.prototype.addHit = function addHit() {
        this.hits++;
    };

    Ship.prototype.isDead = function isDead() {
        return this.hits == this.decks;
    };

    return Ship;
})();

var Controller = (function () {
    var self;
    function Controller(userField, compField) {
        _classCallCheck(this, Controller);

        this.steps = 0;
        this.player = null;
        this.userField = userField;
        this.compField = compField;
        this.activeField = null;
        this.serviseText = getElement(".battleship-btn_servise-text");
        this.username = "";
    }

    Controller.prototype.init = function init(username) {
        // console.log('START');
        self = this;
        this.username = username;
        var rnd = getRandom(2);
        self.player = rnd == 0 ? "user" : "comp";
        if (self.player === "user") {
            self.compField.field.addEventListener("click", self.shoot);
            self.activeField = self.compField;
            self.showServiseText("Вы стреляете первым.");
        } else {
            self.activeField = self.userField;
            self.showServiseText("Первым стреляет компьютер.");
            self.nextShot();
        }
    };

    Controller.prototype.shoot = function shoot(e) {
        var x = void 0,
            y = void 0;
        if (e !== undefined) {
            x = e.target.dataset.cellIndex;
            y = e.target.dataset.rowIndex;
        } else {
            var _self$getCoordinatesS = self.getCoordinatesShot();

            y = _self$getCoordinatesS[0];
            x = _self$getCoordinatesS[1];
        }
        if (x == undefined || y == undefined) {
            self.showServiseText(
                self.player == "user"
                    ? self.username +
                    ", \u0412\u044B \u043F\u043E\u043F\u0430\u043B\u0438 \u0432 \u0440\u0435\u0448\u0435\u0442\u043A\u0443, \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u0432\u044B\u0441\u0442\u0440\u0435\u043B."
                    : ""
            );
            self.nextShot();
            return;
        }
        switch (self.activeField.matrix[y][x]) {
            case 0:
                self.setMissedShot(x, y);
                self.activeField.drawField();
                self.showServiseText(
                    self.player == "user"
                        ? self.username +
                        ", \u0412\u044B \u043F\u0440\u043E\u043C\u0430\u0445\u043D\u0443\u043B\u0438\u0441\u044C. \u0425\u043E\u0434\u0438\u0442 \u043A\u043E\u043C\u044C\u044E\u0442\u0435\u0440"
                        : "Компьютер промахнулся. Ваш ход."
                );
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
                var ship = self.getShipByMatrixCoordinats(x, y);
                ship.addHit();
                if (ship.isDead()) {
                    self.surroundShip(ship);
                    self.increaseKilledShips();
                }
                self.setHittedShot(x, y);
                self.activeField.drawField();
                if (self.isEndOfGame()) {
                    self.showServiseText(
                        self.player == "user"
                            ? "\u0412\u044B \u0432\u044B\u0439\u0433\u0440\u0430\u043B\u0438, " +
                            self.username +
                            "!"
                            : "Компьютер выйграл!"
                    );
                    self.compField.field.removeEventListener("click", self.shoot);
                    return;
                }
                self.showServiseText(
                    self.player == "user"
                        ? self.username +
                        ", \u0412\u044B \u043F\u043E\u043F\u0430\u043B\u0438 \u0432 \u043A\u043E\u0440\u0430\u0431\u043B\u044C!"
                        : "Компьютер попал, ходит еще раз!"
                );
                self.nextShot();
                break;
            default:
                if (self.player == "comp") {
                    setTimeout(function () {
                        return self.shoot();
                    }, 1000);
                } else {
                    self.showServiseText(
                        "В данную клетку стрелять нельзя. Выберите другую!"
                    );
                }
                break;
        }
    };

    Controller.prototype.changeActiveField = function changeActiveField() {
        this.activeField = this.player == "comp" ? this.userField : this.compField;
    };

    Controller.prototype.changePlayer = function changePlayer() {
        this.player = this.player == "comp" ? "user" : "comp";
    };

    Controller.prototype.nextShot = function nextShot() {
        if (self.player == "comp") {
            self.compField.field.removeEventListener("click", self.shoot);
            self.compShot();
        } else {
            self.activeField.field.addEventListener("click", self.shoot);
        }
    };

    Controller.prototype.compShot = function compShot() {
        setTimeout(function () {
            self.shoot();
        }, 500);
    };

    Controller.prototype.setMissedShot = function setMissedShot(x, y) {
        self.activeField.matrix[y][x] = -1;
    };

    Controller.prototype.getShipByMatrixCoordinats = function getShipByMatrixCoordinats(
        x,
        y
    ) {
        return self.activeField.ships[self.activeField.matrix[y][x] - 1];
    };

    Controller.prototype.setHittedShot = function setHittedShot(x, y) {
        self.activeField.matrix[y][x] = 15;
    };

    Controller.prototype.showServiseText = function showServiseText(text) {
        this.serviseText.innerHTML = text;
    };

    Controller.prototype.surroundShip = function surroundShip(ship) {
        var fromX = getToCoord(ship.x);
        var toX = getFromCoordByAlign(ship.x, ship.kx, ship.decks);
        var fromY = getToCoord(ship.y);
        var toY = getFromCoordByAlign(ship.y, ship.ky, ship.decks);

        for (var i = fromX; i < toX; i++) {
            for (var j = fromY; j < toY; j++) {
                if (self.activeField.matrix[j][i] == 0) {
                    self.activeField.matrix[j][i] = -1;
                }
            }
        }
    };

    Controller.prototype.increaseKilledShips = function increaseKilledShips() {
        self.activeField.killedShipsCount++;
    };

    Controller.prototype.isEndOfGame = function isEndOfGame() {
        return self.activeField.killedShipsCount == 10 ? true : false;
    };

    Controller.prototype.getCoordinatesShot = function getCoordinatesShot() {
        var temp =
            self.activeField.shotsList[getRandom(self.activeField.shotsList.length)];
        self.activeField.shotsList = self.activeField.shotsList.filter(function (
            item
        ) {
            return item != temp;
        });
        return temp;
    };

    return Controller;
})();

var getElement = function getElement(name) {
    return document.querySelector(name);
};

var getRandom = function getRandom(n) {
    return Math.floor(Math.random() * n);
};

var getFromCoordByAlign = function getFromCoordByAlign(coord, align, ship) {
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
};

var getToCoord = function getToCoord(coord) {
    return coord > 0 ? coord - 1 : coord;
};

getElement(".battleship-btn_start").addEventListener("click", function (e) {
    var allShips = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

    var fieldUser = getElement(".battleship-field-user");
    var userField = fieldUser && new Field(fieldUser, "user");
    userField.createNewField();

    var fieldComp = getElement(".battleship-field-computer");
    var compField = fieldComp && new Field(fieldComp, "comp");
    compField.createNewField();

    allShips.forEach(function (decks) {
        var shipInfo = userField.getCoordinatsByDecks(decks);
        var ship = new Ship(shipInfo);
        userField.addShipToField(ship);

        var shipInfo2 = compField.getCoordinatsByDecks(decks);
        var ship2 = new Ship(shipInfo2);
        compField.addShipToField(ship2);
    });

    userField.drawField();
    compField.drawField();

    userField.field.style.display = "block";
    compField.field.style.display = "block";

    getElement(".battleship-btn_play").setAttribute("hidden", true);
    getElement(".battleship-btn_title").setAttribute("hidden", true);

    var username = getElement(".battleship-user-name").value;

    getElement("#battleship-form").style.display = "none";
    getElement(".battleship-overlay").style.display = "none";

    var controller = new Controller(userField, compField);
    controller.init(username);
    e.preventDefault();
});

getElement("#play").addEventListener("click", function (e) {
    getElement("#battleship-form").style.display = "block";
    getElement(".battleship-overlay").style.display = "block";
});
