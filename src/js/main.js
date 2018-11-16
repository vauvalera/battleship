import Field from './classes/field';
import functions from './functions';
import Ship from './classes/ship';
import Controller from './classes/controller';

functions.getElement('.battleship-btn_start').addEventListener('click', (e)  => {

    const allShips = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

    const fieldUser = functions.getElement('.battleship-field-user');
    let userField = fieldUser && (new Field(fieldUser, 'user'));
    userField.createNewField();


    const fieldComp = functions.getElement('.battleship-field-computer');
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

    functions.getElement('.battleship-btn_play').setAttribute('hidden', true);
    functions.getElement('.battleship-btn_title').setAttribute('hidden', true);

    const username = functions.getElement('.battleship-user-name').value;

    functions.getElement('#battleship-form').style.display = 'none';
    functions.getElement('.battleship-overlay').style.display = 'none';
    
    const controller = new Controller(userField, compField);
    controller.init(username);
    e.preventDefault();
});

functions.getElement('#play').addEventListener('click', e => {
    functions.getElement('#battleship-form').style.display ='block';
    functions.getElement('.battleship-overlay').style.display ='block';
});

