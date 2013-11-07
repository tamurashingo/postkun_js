/**
 * PostKun - JavaScript version
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2002, 2013 tamura shingo
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

enchant();

var SCREEN_WIDTH = 120;
var SCREEN_HEIGHT = 160;
var POST_WIDTH = 35;
var POST_HEIGHT = 58;
var FPS = 10;

var CENTER_X = (SCREEN_WIDTH - POST_WIDTH) / 2;
var CENTER_Y = (SCREEN_HEIGHT - POST_HEIGHT) / 2;


var NAWA_LINE = {
    init: [
        // 0
        [19,46],
        // 1
        [19,46],
        // 2
        [19,46],
        // 3
        [19,46],
        // 4
        [19,46],
        // 5
        [19,46],
        // 6
        [19,41]],
    nawa: [
        // 0
        [[25,54],[38,58],[46,58],[42,54],[41,53],[4,46]],
        // 1
        [[31,50],[42,42],[42,28],[32,20],[1,18],[-3,29],[3,42],[14,46]],
        // 2
        [[30,41],[35,15],[22,-5],[2,10],[7,44],[14,48]],
        // 3
        [[29,46],[31,22],[12,6],[0,28],[3,42],[14,46]],
        // 4
        [[27,42],[11,23],[-7,20],[-7,28],[7,44],[14,46]],
        // 5
        [[16,54],[5,58],[-5,55],[-5,51],[7,47],[14,46]],
        // 6
        [[23,50],[22,55],[18,56],[11,52],[14,53]]
    ]
};


window.onload = function() {
    var game = new Game(SCREEN_WIDTH, SCREEN_HEIGHT);
    game.fps = FPS;
    game.preload('./img/post.gif', './img/post2.gif');

    game.onload = function() {

        var postkun = {
            isJump: false,
            h: 0,
            x: CENTER_X,
            y: CENTER_Y,
            isOver: false,
            enterFrame: function() {
                if (this.h > 0) {
                    this.h -= 3;
                }
                if (this.h <= 0) {
                    this.isJump = false;
                }
                this.y = CENTER_Y - this.h;
            },
            jump: function() {
                if (this.isJump == false) {
                    this.isJump = true;
                    this.h = 6;
                }
            },
            over: function() {
                this.isOver = true;
                this.x = CENTER_X - 10;
            },
            init: function() {
                this.x = CENTER_X;
                this.y = CENTER_Y;
                this.h = 0;
                this.isJump = false;
                this.isOver = false;
            }
        };


        var view = new Surface(SCREEN_WIDTH, SCREEN_HEIGHT);
        var screen = enchant.Class.create(enchant.Sprite, {
            postImg: enchant.Surface.load('./img/post.gif'),
            postImg2: enchant.Surface.load('./img/post2.gif'),
            count: 0,
            isNawaDraw: true,
            turn: function() {
            },
            setTurnOn: function() {
                this.turn = function() {
                    this.count++;
                    if (this.count > 6) {
                        this.count = 0;
                    }
                };
            },
            setTurnOff: function() {
                this.turn = function(){};
            },
            init: function() {
                this.count = 0;
                this.setTurnOff();
            },
            setDrawNawaOn: function() {
                this.isNawaDraw = true;
            },
            setDrawNawaOff: function() {
                this.isNawaDraw = false;
            },
            drawNawa: function(ctx) {
                if (this.isNawaDraw) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgb(0, 0, 0)';
                    ctx.moveTo(CENTER_X + NAWA_LINE.init[this.count][0],
                               CENTER_Y + NAWA_LINE.init[this.count][1]);
                    NAWA_LINE.nawa[this.count].forEach(function(val) {
                        ctx.lineTo(CENTER_X + val[0], CENTER_Y + val[1]);
                    });
                    ctx.stroke();
                }
            },
            drawPost: function(surface) {
                if (postkun.isOver) {
                    surface.draw(this.postImg2, postkun.x, postkun.y);
                }
                else {
                    surface.draw(this.postImg, postkun.x, postkun.y);
                }
            },
            initialize: function() {
                enchant.Sprite.call(this, SCREEN_WIDTH, SCREEN_HEIGHT);
                this.x = 0;
                this.y = 0;

                this.addEventListener(Event.ENTER_FRAME, function() {
                    view.clear();
                    if (this.count < 3) {
                        this.drawNawa(view.context);
                        this.drawPost(view);
                    }
                    else {
                        this.drawPost(view);
                        this.drawNawa(view.context);
                    }
                    
                    this.turn();
                });
            }
            
        })();

        screen.image = view;

        var titleScene = new Scene();
        var waitScene = new Scene();
        var playScene = new Scene();
        var overScene = new Scene();

        var score = 0;

        // Title
        (function(scene, game){

            // 画面構築
            var label = new Label('PostKun');
            label.font = '16px sans-serif';
            label.y = SCREEN_HEIGHT - 18;
            label.x = 2;
            scene.addChild(label);
            scene.backgroundColor = 'rgb(255, 255, 255)';

            // タイトル表示時の初期処理
            scene.addEventListener(Event.ENTER, function() {
                scene.addChild(screen);
                screen.init();
                screen.setTurnOn();
                screen.setDrawNawaOn();
            });

            // 画面押下
            scene.addEventListener(Event.TOUCH_START, function(e) {
                game.replaceScene(waitScene);
            });

            // フレーム処理
            scene.addEventListener(Event.ENTER_FRAME, function() {
                postkun.enterFrame();
                if (screen.count == 5) {
                    postkun.jump();
                }
            });

        })(titleScene, game);

        // カウントダウン
        (function(scene, game){

            // 画面構築
            var label = new Label('3...');
            var counter = 0;
            label.font = '16px sans-serif';
            label.y = 0;
            label.x = 2;
            scene.addChild(label);
            scene.backgroundColor = 'rgb(255, 255, 255)';

            // 初期処理
            scene.addEventListener(Event.ENTER, function() {
                scene.addChild(screen);
                screen.init();
                screen.setTurnOff();
                screen.setDrawNawaOn();
                score = 0;
                counter = 0;
                label.text = '3...';
                postkun.init();
            });

            // フレーム処理
            scene.addEventListener(Event.ENTER_FRAME, function() {
                counter++;
                // 3...
                // wait 800ms
                if (counter == 8) {
                    label.text = '2...';
                }
                // 2...
                // wait 800ms
                else if (counter == 16) {
                    label.text = '1...';
                }
                // 1...
                // wait 800ms
                else if (counter == 24) {
                    label.text = 'start!';
                }
                // start!
                // wait 800ms
                else if (counter == 32) {
                    game.replaceScene(playScene);
                }
            });
        })(waitScene, game);


        // Playing
        (function(scene, game){
            
            // 画面構築
            var label = new Label("score:" + score);
            label.font = '16px sans-serif';
            label.y = 2;
            label.x = 2;
            scene.addChild(label);
            scene.backgroundColor = 'rgb(255, 255, 255)';

            // 初期処理
            scene.addEventListener(Event.ENTER, function() {
                scene.addChild(screen);
                screen.init();
                screen.setTurnOn();
                screen.setDrawNawaOn();
            });
            
            // フレーム処理
            scene.addEventListener(Event.ENTER_FRAME, function() {
                postkun.enterFrame();
                if (screen.count == 6) {
                    if (postkun.isJump) {
                        score++;
                        label.text = "score:" + score;
                    }
                    else {
                        game.replaceScene(overScene)
                    }
                }
            });

            // 画面押下
            scene.addEventListener(Event.TOUCH_START, function(e) {
                postkun.jump();
            });

        })(playScene, game);

        // Over
        (function(scene, game){
            var count;
            var label = new Label("score:");
            var replay = new Label("REPLAY?");
            label.font = '16px sans-serif';
            label.y = 2;
            label.x = 2;
            scene.addChild(label);
            replay.font = '16px sans-serif';
            replay.y = SCREEN_HEIGHT - 18;
            replay.x = 2;
            scene.addChild(replay);

            scene.backgroundColor = 'rgb(255, 255, 255)';

            // 初期処理
            scene.addEventListener(Event.ENTER, function() {
                scene.addChild(screen);
                screen.init();
                screen.setTurnOff();
                screen.setDrawNawaOff();
                label.text = "score:" + score;
                replay.text = "";
                count = 0;
                postkun.over();
            });

            // フレーム処理
            // 1.5秒後くらいに再プレイの問い合わせ
            scene.addEventListener(Event.ENTER_FRAME, function() {
                if (count > 15) {
                    replay.text = 'REPLAY?';
                }
                else {
                    count++;
                }
            });

            // ボタン押下
            scene.addEventListener(Event.TOUCH_START, function(e) {
                if (count > 15) {
                    game.replaceScene(waitScene);
                }
            });

        })(overScene, game);

        game.replaceScene(titleScene);
    };
    game.start();
};


