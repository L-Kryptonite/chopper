import { _decorator, Component, Node, RigidBody2D, Vec2, input, Input, Collider2D, Contact2DType, Vec3, instantiate, Prefab, Label, Director,sys } from 'cc';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;


@ccclass('Game')
export class Game extends Component {
    @property({ type: AudioManager })
    private audioManager: AudioManager = null;//绑定audioManager节点

    @property({ type: Node })
    private ballNode: Node = null; // 绑定ball节点

    @property({ type: Node })
    private blocksNode: Node = null; // 绑定blocks节点

    @property({ type: Prefab })
    private blockPrefab: Prefab = null; // 绑定block预制体文件

    @property({ type: Label })
    private scoreLabel: Label = null; // 绑定score节点


    //@property({ type: Node })
    //private scoreMgr: Node = null; // 绑定scoreMgr节点

    @property({ type: Label })
    private maxLabel: Label = null;

    @property({ type: Label })
    private curLabel: Label = null;

    
    private scoreNum: number = 0;
    

    private blockGap: number = 200; // 两块跳板的间距
    private bounceSpeed: number = 0; // 小球第一次落地时的速度
    private gameState: number = 0; // 0: 等待开始 1：游戏开始 2：游戏结束

    private score: number = 0; // 游戏得分

    start() {
       //监听事件   
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);

        this.collisionHandler();

        this.ballNode.position = new Vec3(-414, 200, 0); // 设置小球的初始位置
        this.initBlock(); // 初始化跳板
        
       
    }

    update(dt) {
        if (this.gameState == 1) {
            this.moveAllBlock(dt);
        }
    }


    onLoad() {
        const scoreNum = sys.localStorage.getItem('score');
        this.maxLabel.string = String(scoreNum || 0);
        this.curLabel.string = '0';
        this.scoreNum = 0;
    }

    addScore() {
        this.scoreNum++;
        this.curLabel.string = String(this.scoreNum);
    }

    updateHistoryScore() {
        const historyScore = sys.localStorage.getItem('score');
        const currentScore = String(this.scoreNum);

        if (historyScore == null) {
            sys.localStorage.setItem('score', currentScore);
            return;
        }

        if (this.scoreNum > Number(historyScore)) {
            sys.localStorage.setItem('score', currentScore);
        }
    }




    //控制碰撞回到初始位置
    collisionHandler() {
        let collider = this.ballNode.getComponent(Collider2D);
        let rigidbody = this.ballNode.getComponent(RigidBody2D);
                                    //BEGIN_CONTACT只有两个碰撞体开始接触时被调用一次
        collider.on(Contact2DType.BEGIN_CONTACT, () => {
            this.audioManager.playSound();
            
            // 首次落地前bounceSpeed值为0，此时会将小球落地速度的绝对值进行赋值
            if (this.bounceSpeed == 0) {
                this.bounceSpeed = Math.abs(rigidbody.linearVelocity.y);
            } else {
                // 此后落地反弹的速度锁定为第一次落地的速度
                rigidbody.linearVelocity = new Vec2(0, this.bounceSpeed);
            }
        }, this);
    }
    //监听响应函数
    onTouchStart() {
        // 只有小球落地后才可以进行操作
        if (this.bounceSpeed == 0) return;
        

        let rigidbody = this.ballNode.getComponent(RigidBody2D);
        // 将小球的下落速度变成反弹速度的1.5倍，实现加速逻辑   linearVelocity为线性速度
        rigidbody.linearVelocity = new Vec2(0, -this.bounceSpeed * 1.5);
        this.gameState = 1; // 游戏开始
        
       
    }

    // 初始化跳板
    initBlock() {
        let posX;

        for (let i = 0; i < 8; i++) {
            if (i == 0) {
                posX = this.ballNode.position.x; // 第一块跳板生成在小球下方
            } else {
                posX = posX + this.blockGap; // 根据间隔获取下一块跳板位置
            }

            this.createNewBlock(new Vec3(posX, 0, 0));
        }
    }

    // 创建新跳板
    createNewBlock(pos) {
        let blockNode = instantiate(this.blockPrefab); // 创建预制节点
        blockNode.position = pos; // 设置节点生成位置
        this.blocksNode.addChild(blockNode); // 将节点添加到blocks节点下
    }

    // 移动所有跳板
    moveAllBlock(dt) {
        let speed = -300 * dt; // 移动速度

        for (let blockNode of this.blocksNode.children) {
            let pos = blockNode.position.clone();
            pos.x += speed;
            blockNode.position = pos;

            this.checkBlockOut(blockNode); // 跳板出界处理
        }
    }

    // 获取最后一块跳板的位置
    getLastBlockPosX() {
        let lastBlockPosX = 0;
        for (let blockNode of this.blocksNode.children) {
            if (blockNode.position.x > lastBlockPosX) {
                lastBlockPosX = blockNode.position.x;
            }
        }
        return lastBlockPosX;
    }

    // 跳板出界处理
    checkBlockOut(blockNode) {
        if (blockNode.position.x < -640) {
            // 将出界跳板的坐标修改到下一个要出现的位置
            let nextBlockPosX = this.getLastBlockPosX() + this.blockGap;
            //随机Y轴位置
            let nextBlockPosY = (Math.random() > .5 ? 1 : -1) * (10+40 * Math.random());
            //随机宽度，原始宽度的0.3~1.5之间
            const newWidth =0.3+Math.random()*0.5;
            blockNode.scale = new Vec3(newWidth,blockNode.scale.y,blockNode.scale.z);
            blockNode.position = new Vec3(nextBlockPosX, nextBlockPosY, 0);

            //this.incrScore(); // 增加得分
            this.addScore();
           
        }

        // 小球掉出屏幕外
        if (this.ballNode.position.y < -940) {

            this.gameState = 2;
            this.updateHistoryScore();
            
            Director.instance.loadScene('Over'); // 加载Over场景
        }
    }

    // 得分增加
    incrScore() {
        this.score = this.score + 1;
        this.scoreLabel.string = String(this.score);
    }
}