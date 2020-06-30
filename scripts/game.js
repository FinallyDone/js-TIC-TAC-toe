//////////////////////////////////// Global elem /////////////////////////////////////
/*
    Записываем значение позиции элемента
    на который наводит курсор пользователь
    ! если 0, не выбрано ничего
    ! если -1, то элементом является
    кнопка "Новая игра"
*/
let whichElemOfGame = 0;
/* Таймер */
let timer;
/* Подсчет очков */
let Points = 0;
/* запрет и разрешение на клик */
let canClick = true;
/* Проверка на победу пк или пользователя */
let winGame = false;
/*
    Проверка на смену хода
     false - ходит первый пользователь
     true - ходит первый пк
*/
let ChanchedTurn = false;

/*
    История совершенная компьютером и игроком
    0 и четные числа - ходы игрока
    нечетные числа - ходы компьютера
*/
let history = [];

/*
    -Ходы только компьютера, используется
    чтобы он не повторял своих ходы
    -Количество ходов  
    -Лучшие ходы для пользователя и пк
*/
let historyPcTurns = [];
let howMuchTurnsMaden = 0;
let bestTurnsOfPc = [0, 0, 0, 0, 0];
let bestTurnsOfPlayer = [0, 0, 0, 0, 0];
/* 
    Игровое поле
    ! -1 ход компьютера
    ! 0 можно сделать ход
    ! 1 ход пользователя
*/
let match = [[0, 0, 0],
             [0, 0, 0],
             [0, 0, 0]];

//////////////////////////////////// Functions ////////////////////////////////////////

/* Рендер игрового поля */
function renderGameField() {
    let game = document.querySelector(".game");
    history = [];
    // Очистка поля
    game.innerHTML = "";
    // Заполняем поле для новой игры
    for (let i = 1; i <= 9; i++)
        game.innerHTML +=
        `
            <div class="game-box game-box_hover game-box_background" onmouseenter="MouseEnter(event)" onmouseleave="MouseLeave(event)">
                <span class="game-box-position">${i}</span>
            </div>
        `;
    howMuchTurnsMaden = 0;
    clearTimeout(timer);
    match = [[0, 0, 0],
             [0, 0, 0],
             [0, 0, 0]];
}

/* Отрисовка счетчика Очков */
function renderPoints() {
    let src;
    let check = true;
    let tempStr, str = "";
    let element = document.querySelector(".game-score");
    element.innerHTML = `<img class="game-score-img" src="material/png/Counter.png" alt="counter-img" />`;
    let CopyPoints = Points;
    while (check) {
        tempStr = `
            <img class="game-score-number" src="material/png/Numbers/Number-${Math.floor(CopyPoints % 10)}.png" 
            alt="img-number" />`;
        tempStr += str;
        str = tempStr;
        CopyPoints = CopyPoints / 10;
        if (CopyPoints < 1)
            check = false;
    }
    element.innerHTML += str;
}

/* Очистка истории и ее рендер */
function renderHistory() {
    let element = document.querySelector(".game-history");
    element.innerHTML = `
            <img class="game-history-logo-img" src="material/png/History-logo-not-mobile.png" alt="img-history">`;
}

/* Добавление элемента в историю и его рендер */
function renderHistoryElem(who) {
    if (howMuchTurnsMaden > history.length) howMuchTurnsMaden = history.length;
    let element = document.querySelector(".game-history");
    let [x, y] = history[howMuchTurnsMaden - 1];
    element.innerHTML += `
            <div class="game-history__turn game-history__turn_disp_grid">
                <img class="game-history__who-img game-history__img" src="material/png/History-${who}.png" alt="img-who"/>
                <img class="game-history__X-img game-history__img" src="material/png/History-X.png" alt="img-X"/>
                <img class="game-history__number-img game-history__img" src="material/png/Numbers/Number-${x+1}.png" alt="img"/>
                <img class="game-history__Y-img game-history__img" src="material/png/History-Y.png" alt="img-Y"/>
                <img class="game-history__number-img game-history__img" src="material/png/Numbers/Number-${y+1}.png" alt="img"/>
            </div>
    `;
}

/* Мозг компьютера для игрового процесса */
function brainOfPc() {
    /*
        !Можно добавить на страницу как элемент 
          для настройки
        Сложность - можно настраивать
        Определяет вероятность хода пк
            0 - глупый ход makeStupidTurn
            1 - лучший ход makeBestTurn
    */
    let difficult = [0, 0, 0, 1, 1, 1, 1, 1, 1];
    let random = GetRandomInt(1, (difficult.length - 2));
    let method = difficult[random];
    switch (method) {
        case 0:
            makeStupidTurn();
            break;
        case 1:
            makeBestTurn();
            break;
    }

    // Разрешаем кликать пользователю 
    canClick = true;
    howMuchTurnsMaden++;
    // добавляем в историю, куда сделал ход пк
    renderHistoryElem("pc");
}

/* Сделать ход основанный на лучших ходов */
function makeBestTurn() {
    // ходы компьютера для победы
    bestTurnsOfPc = [0, 0, 0, 0, 0];
    bestTurnsOfPlayer = [0, 0, 0, 0, 0];
    let turnsOfPc = [];
    let turnsOfPlayer = [];
    let x, y;
    /*
        -проверка можно ли выиграть партию
        -записать самый быстрый путь к победе 
        в bestTurnsOfPc, bestTUrnsOfPlayer
        -пк ходит по своим лучшим ходам, если их меньше или 
        равно количеству ходам пользователя
        -пк ходит по лучшим ходам пользователя, 
        если ему нужно меньше ходов для победы
        -пк ходит глупо, если нету возможности 
        победить кому-либо
    */
    checkBestWays(turnsOfPc, turnsOfPlayer, howMuchTurnsMaden);
    // Проверка, смогли ли найти путь к победе
    if (bestTurnsOfPc[0] != 0 && (bestTurnsOfPc.length <= bestTurnsOfPlayer.length)) {
        [x, y] = findPosition(bestTurnsOfPc[0]);
        history.push([x, y]);
        match[y][x] = -1;
        loadPictureInGame((y * 3 + x + 1), "pc");
    } else if (bestTurnsOfPlayer[0] != 0) {
        // пк не нашел способа выиграть
        // тогда мешаем пользователю победить
        [x, y] = findPosition(bestTurnsOfPlayer[0]);
        history.push([x, y]);
        match[y][x] = -1;
        loadPictureInGame((y * 3 + x + 1), "pc");
    } else {
        // Партию никому не выйграть
        makeStupidTurn();
    }

    // Проверяем на победу пк
    if (checkIfWin(x, y, -1))
        gameFinished("pc");
}

/* 
    Выбор лучших ходов
    -Перебор всех вариаций
    -Запись лучших ходов для пк
    -Запись лучших ходов для пользователя
*/
function checkBestWays(turnsPc, turnsOfPlayer, howMuchTurns) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (match[i][j] == 0) {
                if (howMuchTurns % 2 != 0) {
                    turnsPc.push(i * 3 + j + 1);
                    match[i][j] = -1;
                } else {
                    turnsOfPlayer.push(i * 3 + j + 1);
                    match[i][j] = 1;
                }

                if (howMuchTurns >= 4) {
                    if (checkIfWin(j, i, -1)) {
                        if (bestTurnsOfPc.length > turnsPc.length)
                            bestTurnsOfPc = turnsPc.slice();
                    }

                    if (checkIfWin(j, i, 1)) {
                        if (bestTurnsOfPlayer.length > turnsOfPlayer.length)
                            bestTurnsOfPlayer = turnsOfPlayer.slice();
                    }
                }

                checkBestWays(turnsPc, turnsOfPlayer, (howMuchTurns + 1));
                match[i][j] = 0;
                if (howMuchTurns % 2 != 0)
                    turnsPc.pop();
                else
                    turnsOfPlayer.pop();

            }
        }
    }
}

/* 
    Глупый ход в первую свободную клетку
*/
function makeStupidTurn() {
    // Делаем ход в первую клетку
    let turnForNothing = false;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (match[i][j] == 0 && !turnForNothing) {
                x = j;
                y = i;
                turnForNothing = true;
            }
        }
    }
    history.push([x, y]);
    match[y][x] = -1;
    loadPictureInGame((y * 3 + x + 1), "pc");

    // Проверяем на победу пк
    if (checkIfWin(x, y, -1))
        gameFinished("pc");
}

/* Проверка на победу пользователя или пк */
function checkIfWin(x, y, who) {
    let i;
    let winHorizontal = false;
    let winVertical = false;
    let winDiagonalL = false;
    let winDiagonalR = false;

    if (match[0][x] == who && match[1][x] == who && match[2][x] == who)
        winVertical = true;
    if (match[y][0] == who && match[y][1] == who && match[y][2] == who)
        winHorizontal = true;
    if ((x + 1) * (y + 1) % 2 != 0 || (x && y) == who) {
        if (x != y || (x && y) == 1)
            for (i = 0; i < 3; i++) {
                winDiagonalR = (match[2 - i][0 + i] == who) ? true : false;
                if (!winDiagonalR) break;
            }
        if (x == y)
            for (i = 0; i < 3; i++) {
                winDiagonalL = (match[0 + i][0 + i] == who) ? true : false;
                if (!winDiagonalL) break;
            }
    }

    if (winHorizontal || winVertical || winDiagonalL || winDiagonalR)
        return true;
    else return false;
}

/* Загрузка изображения в игровой элемент */
function loadPictureInGame(position, who) {
    let src;
    let elements = document.querySelectorAll(".game-box");
    // Убираем хувер, чтобы пользователь понял
    // визуально, что элемент не в игре
    elements[position - 1].classList.remove("game-box_hover");
    // Определяем, какую картинку грузить,
    // исходяя из того, чей ход был
    if (who == "pc") src = "material/png/Dagger.png";
    else src = "material/png/Circle.png"
    // Добавляем картинку хода пользователя
    elements[position - 1].innerHTML +=
        `<img class="game-box-img" src=${src} alt="img" />`;

}

/* Получения координат из 1 мер в 2 мер */
function findPosition(position) {
    let x, y;
    if (position > 3)
        y = Math.trunc((position - 1) / 3);
    else
        y = 0;
    x = (position - 1) % 3;
    return [x, y];
}

/* 
    Кто-то победил
    -убираем у всех хувер, чтобы визуально было понятно,
    что невозможно больше играть
    -добавляем или отнимаем очки:
        +10 если победа пользователя
        -5 если победа пк
*/
function gameFinished(who) {
    winGame = true;
    let elements = document.querySelectorAll(".game-box");
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (match[i][j] == 0)
                elements[(i * 3 + j)].classList.remove("game-box_hover");
        }
    }
    if (who == "pc")
        Points -= 5;
    else
        Points += 10;
    if (Points < 0)
        Points = 0;
    renderPoints();
}

//////////////////////////////////// Events ///////////////////////////////////////////

/*
    Загрузка страницы, здесь же рендер
    игрового поля
*/
window.onload = function () {
    renderGameField();
    renderPoints();
    renderHistory();
}
/*
    Обработчик клика
    ! Записывает историю совершенных
    пользователем действий
    ! Убираем элемент из игры,
    на который кликнул пользователь
    ! Длеает просчет не победил ли пользователь
        -Если победил, то объявляем и 
        добавляем очки в общий счетчик
*/
document.addEventListener("click", function (e) {
    // Проверка для отключения возможности 
    // создания элемента "Подгрузки"
    if (canClick) {
        /* Клик по элементу игры */
        if (whichElemOfGame != -1 && whichElemOfGame != -2 && !winGame) {
            howMuchTurnsMaden++;
            /*
                Определяем какой элемент в 2-х мерном пр-ве
                Для упрощения работы в дальнейшем
            */
            let [x, y] = findPosition(whichElemOfGame);
            /*
                Клик по игровому элементу,
                с которым еще не взаимодействовали
            */
            if (whichElemOfGame != -1 && whichElemOfGame != 0 && match[y][x] == 0) {
                // Убираем элемент из игры
                history.push([x, y]);
                match[y][x] = 1;
                // Подгружаем картинку в элемент игры
                loadPictureInGame(whichElemOfGame, "person");
                // Добавляем куда сделал пользователь ход в историю
                renderHistoryElem("person");

                // Проверяем, победа ли пользователя
                if (checkIfWin(x, y, 1, match))
                    gameFinished();
                // Запрещаем кликать пользователю, 
                // для создания эффетка "обработки" пк
                if (!winGame && (howMuchTurnsMaden < 9)) {
                    canClick = false;
                    timer = setTimeout(brainOfPc, 600);
                }
            }
        } else if (whichElemOfGame == -1) {
            /* Клик по кнопке "Новая игра" */
            winGame = false;
            renderGameField();
            renderHistory();
            if (ChanchedTurn)
                brainOfPc();
        } else if (whichElemOfGame == -2) {
            /* Клик по кнопке "Сменить Ход" */
            // Переключение режима
            // Очистка таймер, чтобы не было бага
            clearTimeout(timer);
            ChanchedTurn = (ChanchedTurn) ? false : true;
            winGame = false;
            if (ChanchedTurn) {
                if (!winGame && howMuchTurnsMaden == 0) {
                    renderHistory();
                    brainOfPc();
                } else {
                    renderGameField();
                    renderHistory();
                    brainOfPc();
                }
            } else {
                renderGameField();
                renderHistory();
            }
        }
    }
});

/* 
    Определяет позицию элемента в игре,
    когда пользователь наводится на него
    Сделано для упрощения работы с кликом 
    
    В противном случае, определяем, что
    пользователь намерен нажать на 
    кнопку "Новая игра"
*/
function MouseEnter(event) {
    //Элемент - кнопка "Новая игра"
    if (event.target.children[0].innerHTML == "Button 1") {
        whichElemOfGame = -1;
    } else if ((event.target.children[0].innerHTML == "Button 2")) {
        //Элемент - кнопка "Сменить Ход"
        whichElemOfGame = -2;
    } else {
        //Элемент Игры
        whichElemOfGame = event.target.children[0].innerHTML;
    }
}

/* 
    Определяет, что пользователь не собирается
    кликнуть на элемент в игре
*/
function MouseLeave(event) {
    whichElemOfGame = 0;
}

//////////////////////////////////// Patterns /////////////////////////////////////////
function GetRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return (Math.floor(Math.random() * (max - min + 1)) + min);
}
