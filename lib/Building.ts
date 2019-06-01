import * as P from "pixi.js";
import {EVENTS} from "./conf/constant";

export default class Building {
    private theWayIsFree: boolean = true;
    private topDoor: number = window.innerHeight/2-100;
    private bottomDoor: number = window.innerHeight/2+100;
    private readonly wayEvent: CustomEvent ;

    constructor(app: P.Application){
        let building = this.drawBuilding()
        this.wayEvent = new CustomEvent(EVENTS.WAY_IS_FREE)
        app.stage.addChild(building);
    }

    private drawBuilding():P.Graphics{
        let building = new P.Graphics();
        building.lineStyle(5, 0xffed0a);
        building.moveTo(window.innerWidth*0.2, 0);
        building.lineTo(window.innerWidth*0.2, this.topDoor);
        building.moveTo(window.innerWidth*0.2, this.bottomDoor);
        building.lineTo(window.innerWidth*0.2, window.innerHeight);
        building.endFill();
        return building
    }

    get wayFree(){
        return this.theWayIsFree
    }

    public changeWayFlag():void{
        this.theWayIsFree = !this.theWayIsFree
        if(this.theWayIsFree)
            window.dispatchEvent(this.wayEvent);
    }

    get doorsPosition(){
        return {
            topDoor:this.topDoor,
            bottomDoor: this.bottomDoor
        }
    }
}
