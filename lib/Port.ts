import * as P from "pixi.js";
import {Constant} from "./conf/constant";

export default class Port {
    public port:P.Graphics;
    public isEmpty:boolean = true;
    public freeToVisit:boolean = true;
    public height:number;
    public width:number;

    constructor(){
        this.height = window.innerHeight/Constant.PORTS_COUNT-40
        this.width = 30
    }

    public drawPort(app: P.Application, positionNumber:number):void{
        this.port = new P.Graphics();
        if(!this.isEmpty)
            this.port.beginFill(0xffed0a,1);
        this.port.lineStyle(5, 0xffed0a);
        this.port.drawRect(0,0, this.width, this.height);
        this.port.x = 20;
        this.port.y = window.innerHeight/Constant.PORTS_COUNT*positionNumber-this.height*1.1;
        this.port.endFill();
        app.stage.addChild(this.port);
    }

    public changeFillPort():void{
        this.isEmpty = !this.isEmpty
        let {x, y} = this.port
        this.port.clear();
        this.port.lineStyle(5, 0xffed0a);
        this.port.beginFill(0xffed0a, this.isEmpty ? 0 : 1);
        this.port.drawRect(0, 0, this.width, this.height);
        this.port.x = x;
        this.port.y = y;
    }

    public set changeVisitStatus(status:boolean){
        this.freeToVisit = status
    }

    public get visitStatus(){
        return this.freeToVisit
    }
}
