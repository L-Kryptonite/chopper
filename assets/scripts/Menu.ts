import { _decorator, Component, Node, Button, Director, find, animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Menu')
export class Menu extends Component {

   


    

    start() {
        let btnNode = find('/Canvas/bg/startBtn');
        btnNode.on(Button.EventType.CLICK, this.gameStart, this);
    }

    gameStart() {
        Director.instance.loadScene('Game'); // 跳转到Game场景
    }
}
