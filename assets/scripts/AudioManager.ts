
import { _decorator, Component, Node, AudioClip, AudioSource } from 'cc';
const { ccclass, property } = _decorator;


 
@ccclass('AudioManager')
export class AudioManager extends Component {
    @property({type:AudioClip})
    public clickClip:AudioClip = null;

    private audioSource:AudioSource;

    onLoad(){
        this.audioSource=this.getComponent(AudioSource);
    }

    playSound(){
        this.audioSource.playOneShot(this.clickClip,1);
    }
   

    start () {
        // [3]
    }

    
}


