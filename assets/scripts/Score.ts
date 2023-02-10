import { _decorator, Component, Label, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Score')
export class Score extends Component {
    @property({ type: Label })
    private maxLabel: Label = null;

    @property({ type: Label })
    private curLabel: Label = null;

    private scoreNum: number = 0;

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
}
