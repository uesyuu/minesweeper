(function () {
    'use strict';

    // 盤面の定義
    var mine = {
        width: 9,
        height: 9,
        num: 10,
        squareWidth: 16,
        squareHeight: 16,
        map: [],
        openMap: [], //1なら閉じている、0なら開いている、2なら旗が立っている
        game: true,
        gameStart: true,
        startTime: 0,
        endTime: 0,
        marginLeft: 30,
        marginTop: 60
    };

    var displayArea = document.getElementById('display-area');
    var resultArea = document.getElementById('result-area');
    var scoreArea = document.getElementById('score-area');

    // 盤面の初期化
    function init(difficulty) {
        mine.game = true;
        mine.gameStart = true;
        mine.startTime = 0;
        mine.endTime = 0;
        resultArea.innerText = '';
        scoreArea.innerText = '0';

        // 盤面の画像の削除
        for (var i = 0; i < mine.width; i++) {
            for (var j = 0; j < mine.height; j++) {
                if (document.getElementById(i + '-' + j)) {
                    document.getElementById(i + '-' + j).parentNode.removeChild(document.getElementById(i + '-' + j));
                }
                if (document.getElementById(i + '-' + j + '-back')) {
                    document.getElementById(i + '-' + j + '-back').parentNode.removeChild(document.getElementById(i + '-' + j + '-back'));
                }
            }
        }

        if(difficulty === 0){
            mine.width = 9;
            mine.height = 9;
            mine.num = 10;
        } else if(difficulty === 1){
            mine.width = 16;
            mine.height = 16;
            mine.num = 40;
        } else if(difficulty === 2){
            mine.width = 30;
            mine.height = 16;
            mine.num = 99;
        } else if(difficulty === 3){
            mine.width = 48;
            mine.height = 24;
            mine.num = 256;
        } else if(difficulty === 4){
            mine.width = 64;
            mine.height = 48;
            mine.num = 777;
        }

        // 盤面を全て0に初期化
        for (var i = 0; i < mine.width; i++) {
            mine.map[i] = [];
            for (var j = 0; j < mine.height; j++) {
                mine.map[i][j] = 0;
            }
        }
        // 開いているマスを示すopenMapを1に初期化
        for (var i = 0; i < mine.width; i++) {
            mine.openMap[i] = [];
            for (var j = 0; j < mine.height; j++) {
                mine.openMap[i][j] = 1;
            }
        }

        // 盤面への地雷の配置
        var count = 0;
        while (count < mine.num) {
            var rand = Math.floor(Math.random() * mine.width * mine.height);
            var top = Math.floor(rand / mine.height);
            var left = rand % mine.width;
            mine.map[top][left] = 1;
            count = 0;
            for (var i = 0; i < mine.width; i++) {
                for (var j = 0; j < mine.height; j++) {
                    count += mine.map[i][j];
                }
            }
        }
        //盤面裏を画像で表示
        for (var i = 0; i < mine.width; i++) {
            for (var j = 0; j < mine.height; j++) {
                var img = document.createElement('img');
                if (mine.map[i][j] === 1) {
                    img.src = 'mine.png';
                } else {
                    img.src = surroundMineNum(i, j) + '.png';
                }
                img.id = i + '-' + j + '-back';
                img.style.position = 'absolute';
                img.style.left = mine.marginLeft + mine.squareWidth * i + 'px';
                img.style.top = mine.marginTop + mine.squareHeight * j + 'px';
                displayArea.appendChild(img);
            }
        }

        // 盤面を画像で表示
        for (var i = 0; i < mine.width; i++) {
            for (var j = 0; j < mine.height; j++) {
                var img = document.createElement('img');
                img.src = 'square.png';
                img.id = i + '-' + j;
                img.style.position = 'absolute';
                img.style.left = mine.marginLeft + mine.squareWidth * i + 'px';
                img.style.top = mine.marginTop + mine.squareHeight * j + 'px';
                displayArea.appendChild(img);
            }
        }
    }

    document.getElementById('start').onclick = init;

    document.getElementById('difficulty').onchange = function () {
        init(document.getElementById('difficulty').selectedIndex);
    };

    document.oncontextmenu = function (e) {
        return false;
    };

    // クリック時の動作
    var buttonNum = 0;
    displayArea.onmousedown = function (e) {
        var x = ( parseInt(e.target.style.left) - mine.marginLeft ) / mine.squareWidth;
        var y = ( parseInt(e.target.style.top) - mine.marginTop ) / mine.squareHeight;
        buttonNum = e.buttons;
        if (buttonNum === 1 || buttonNum === 2) {
            setTimeout(clickDecision, 100, x, y);
        }
    };

    function clickDecision (x,y) {
        if (buttonNum === 1){
            leftClickAction(x,y);
        } else if (buttonNum === 2) {
            rightClickAction(x,y);
        } else if (buttonNum === 3) {
            leftAndRightClickAction(x,y);
        }
    }

    // 左クリック時の動作
    function leftClickAction (x,y) {
        if (mine.game) {
            if (mine.gameStart) {
                mine.startTime = new Date().getTime();
                mine.gameStart = false;
            }

            if (mine.openMap[x][y] === 1) {
                squareOpen(x,y);
            }
        }
    }

    // 右クリック時の動作
    function rightClickAction (x,y) {
        if (mine.game) {
            if (mine.openMap[x][y] === 1) {
                mine.openMap[x][y] = 2;
                document.getElementById(x + '-' + y).src = 'flag.png';
            } else if (mine.openMap[x][y] === 2) {
                mine.openMap[x][y] = 1;
                document.getElementById(x + '-' + y).src = 'square.png';
            }
        }
    }

    // 左右同時クリック時の動作
    function leftAndRightClickAction (x,y) {
        if (mine.game) {
            var count = 0;
            for (var i = -1; i < 2; i++) {
                for (var j = -1; j < 2; j++) {
                    if (0 <= x + i && x + i < mine.width && 0 <= y + j && y + j < mine.height) {
                        if (mine.openMap[x+i][y+j] === 2) {
                            count++;
                        }
                    }
                }
            }

            if (count === surroundMineNum(x,y)) {
                for (var i = -1; i < 2; i++) {
                    for (var j = -1; j < 2; j++) {
                        if (0 <= x + i && x + i < mine.width && 0 <= y + j && y + j < mine.height) {
                            if (mine.openMap[x+i][y+j] === 1) {
                                squareOpen(x+i,y+j);
                            }
                        }
                    }
                }
            }
        }
    }

    function squareOpen(x,y) {
        if (mine.map[x][y] === 1) {
            //もしmine.map[x][y]が地雷だったら、全部のマスを開く
            for (var i = 0; i < mine.width; i++) {
                for (var j = 0; j < mine.height; j++) {
                    if (mine.openMap[i][j] !== 0) {
                        mine.openMap[i][j] = 0;
                        document.getElementById(i + '-' + j).parentNode.removeChild(document.getElementById(i + '-' + j));
                    }
                }
            }
            resultArea.innerText = 'ゲームオーバー…';
            mine.endTime = new Date().getTime();
            scoreArea.innerText = (mine.endTime - mine.startTime) / 1000;
            mine.gameStart = true;
            mine.game = false;
        } else if (surroundMineNum(x, y)) {
            //もしmine.map[x,y]が地雷でなく周りに地雷があったら、そのマスのみを開く
            mine.openMap[x][y] = 0;
            document.getElementById(x + '-' + y).parentNode.removeChild(document.getElementById(x + '-' + y));
        } else {
            //もしmine.map[x,y]が地雷でなく周りに地雷がなかったら、隣接する地雷無しのマスを再帰的に開く
            zeroSquareOpen(x, y);
        }

        // クリアした時の動作
        var clearFlag = true;
        for (var i = 0; i < mine.width; i++) {
            for (var j = 0; j < mine.height; j++) {
                if ( !( (mine.map[i][j] === mine.openMap[i][j]) || (mine.map[i][j] === 1 && mine.openMap[i][j] === 2) ) ) {
                    clearFlag = false;
                }
            }
        }
        if (clearFlag) {
            resultArea.innerText = 'ゲームクリア！';
            mine.endTime = new Date().getTime();
            scoreArea.innerText = (mine.endTime - mine.startTime) / 1000;
            mine.gameStart = true;
            mine.game = false;
        }
    }

    // 周りの地雷の数を数える
    function surroundMineNum(x, y) {
        var count = 0;
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if (0 <= x + i && x + i < mine.width && 0 <= y + j && y + j < mine.height) {
                    count += mine.map[x + i][y + j];
                }
            }
        }
        return count;
    }

    // 隣接する地雷無しのマスを再帰的に開く
    function zeroSquareOpen(x, y) {
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if (0 <= x + i && x + i < mine.width && 0 <= y + j && y + j < mine.height) { // そのマスがあれば
                    if (mine.openMap[x + i][y + j] === 1) { // そのマスが閉じていれば
                        mine.openMap[x + i][y + j] = 0; // マスを開く
                        document.getElementById((x + i) + '-' + (y + j)).parentNode.removeChild(document.getElementById((x + i) + '-' + (y + j)));
                        if (surroundMineNum(x + i, y + j) === 0) { // そのマスの周りが地雷0であればzeroSquareOpenを実行
                            zeroSquareOpen(x + i, y + j);
                        }
                    }
                }
            }
        }
    }

    function updateTime() {
        if (mine.game && (mine.gameStart === false)) {
            var nowTime = new Date().getTime();
            var seconds = (nowTime - mine.startTime) / 1000;
            scoreArea.innerText = seconds;
        }
    }
    setInterval(updateTime, 50);

    init();
})();