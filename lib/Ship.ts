import * as P from "pixi.js";
import TWEEN from 'tween.js'
import Port from "./Port";
import {Constant} from "./conf/constant";
import Main from "../main";

export default class Ship {
    private id:string = `f${(~~(Math.random()*1e8)).toString(16)}`;
    private colors: number[]= [0x16FF00,0xFF2B3E]
    public ship:P.Graphics;
    public color:number;
    public height:number;
    public width:number;
    private type:string;

    constructor(app: P.Application){
        this.spec();
        this.drawShip(app)
        this.start()
        this.step()

    }

    private drawShip(app: P.Application):void{
        this.ship = new P.Graphics();
        this.ship.lineStyle(3, this.color);
        this.ship.beginFill(this.color,this.type === Constant.SETTER ? 1 : 0);
        this.ship.drawRect(0,0, this.width, this.height);
        this.ship.x = window.innerWidth-this.width;
        this.ship.y = window.innerHeight/2-45+this.height;
        this.ship.rotation = 0;
        this.ship.endFill();
        app.stage.addChild(this.ship);
    }

    private spec():void{
        let rand = Math.floor(Math.random() * this.colors.length);
        this.color = this.colors[rand];
        this.type = this.color === 0x16FF00 ? Constant.GETTER : Constant.SETTER
        let port =  new Port()
        this.width = port.height/2
        this.height = port.width
    }
    private start():void{
        let self = this;
        let queue = Main.Instance.getQueue(this.type)
        new TWEEN.Tween(this.ship)
            .to({ x: window.outerWidth*0.2 + this.width + queue.length * this.width + queue.length * this.height }, 2000)
            .onUpdate(function () { self.ship.x = this.x;})
            .onComplete(() =>this.canMove())
            .start();
    }

    public canMove():void {
        let queue = Main.Instance.getQueue(this.type)
        if(Main.Instance.building.wayFree && !queue.length){
            let port = Main.Instance.ports.find(port=>{
                if(this.type === Constant.GETTER)
                    return port.visitStatus && !port.isEmpty
                else return port.visitStatus && port.isEmpty
            })
            if (!port){
                this.wayToQueue()
                return
            }
            this.swimToPort(port)
        }else this.wayToQueue()

    }
    private wayToQueue():void{
        let self = this
        Main.Instance.pushToQueue(this)
        let rotation = this.type > Constant.GETTER ? -90 : 90
        let position = this.type > Constant.GETTER ? Main.Instance.building.doorsPosition.bottomDoor : Main.Instance.building.doorsPosition.topDoor

        let turnToQueue = new TWEEN.Tween(this.ship)
            .to({ rotation: rotation }, 400)
            .onUpdate(function () { self.ship.rotation = this.rotation * Math.PI / 180;})

        let wayToQueue = new TWEEN.Tween(this.ship)
            .to({ y: position}, 750)
            .onUpdate(function () { self.ship.y = this.y;})

        let turnToBay = new TWEEN.Tween(this.ship)
            .to({ rotation: 0 }, 400)
            .onUpdate(function () { self.ship.rotation = this.rotation})

        turnToQueue.chain(wayToQueue);
        wayToQueue.chain(turnToBay);
        turnToQueue.start();
    }
    swimFromQueue(port:Port){
        let self = this
        let rotation = this.type > Constant.GETTER ? 90 : -90
        port.changeVisitStatus = false
        let turnToQueue = new TWEEN.Tween(this.ship)
            .to({ rotation: rotation }, 400)
            .onUpdate(function () { self.ship.rotation = this.rotation * Math.PI / 180;})

        let wayToQueue = new TWEEN.Tween(this.ship)
            .to({ y: window.innerHeight/2-45+this.height}, 750)
            .onUpdate(function () { self.ship.y = this.y;})

        let turnToBay = new TWEEN.Tween(this.ship)
            .to({ rotation: 0 }, 400)
            .onUpdate(function () { self.ship.rotation = this.rotation}).onComplete(() =>this.swimToPort(port))

        turnToQueue.chain(wayToQueue);
        wayToQueue.chain(turnToBay);
        turnToQueue.start();

    }

    private swimToPort(port:Port):void{
        let self = this
        let rotation = port.port.y > window.innerHeight/2 ? -90 : 90
        port.changeVisitStatus = false
        let entranceBay= new TWEEN.Tween(this.ship)
            .to({ x: window.innerWidth*0.1}, 750)
            .onUpdate(function () { self.ship.x = this.x;}).onComplete(() => Main.Instance.building.changeWayFlag())

        let turnToPort = new TWEEN.Tween(this.ship)
            .to({ rotation: rotation}, 400)
            .onUpdate(function () { self.ship.rotation = this.rotation * Math.PI / 180;}).onComplete(() => Main.Instance.building.changeWayFlag())

        let wayToPort = new TWEEN.Tween(this.ship)
            .to({  y: port.port.y + port.port.height/2-this.ship.height/2 }, 750)
            .onUpdate(function () { self.ship.y = this.y;})

        let turnToSelectedPort = new TWEEN.Tween(this.ship)
            .to({ rotation: 0 }, 400)
            .onUpdate(function () { self.ship.rotation = this.rotation * Math.PI / 180;})

        let connectToPort = new TWEEN.Tween(this.ship)
            .to({ x: port.port.x + port.port.width}, 200)
            .onUpdate(function () { self.ship.x = this.x;})
            .onComplete(() =>{
                                let {x, y} = this.ship
                                this.ship.clear();
                                this.ship.lineStyle(5, this.color);
                                if(this.type === Constant.GETTER){
                                    this.ship.beginFill(this.color,  1);
                                }
                                this.ship.drawRect(0, 0, this.width, this.height);
                                this.ship.x = x;
                                this.ship.y = y;
                                port.changeFillPort()
                this.moveBack(rotation,port)
            })
        entranceBay.chain(turnToPort);
        turnToPort.chain(wayToPort);
        wayToPort.chain(turnToSelectedPort);
        turnToSelectedPort.chain(connectToPort);
        entranceBay.start();
    }
    private moveBack(rotation:number,port:Port):void{
        let self = this
        port.changeVisitStatus = true
        let outFromPort = new TWEEN.Tween(this.ship)
            .to({ x: window.innerWidth*0.1}, 200)
            .onUpdate(function () { self.ship.x = this.x;})
        let turnToCenter = new TWEEN.Tween(this.ship)
            .to({ rotation: -rotation }, 400)
            .onUpdate(function () { self.ship.rotation = this.rotation * Math.PI / 180;})
        let wayToCenter = new TWEEN.Tween(this.ship)
            .to({ y: window.outerWidth*0.2 + this.width }, 750)
            .onUpdate(function () { self.ship.y = this.y;})
            .onComplete(() => Main.Instance.building.changeWayFlag())
        let turnToExit = new TWEEN.Tween({rotation:-rotation})
            .to({ rotation:  -2*rotation}, 400)
            .onUpdate(function () { self.ship.rotation = this.rotation * Math.PI / 180;})
        let wayToExit = new TWEEN.Tween(this.ship)
            .to({ x: window.outerWidth*0.2 + this.width }, 750)
            .onUpdate(function () { self.ship.x = this.x;}).onComplete(()=> Main.Instance.building.changeWayFlag());

        let goAway = new TWEEN.Tween(this.ship).to({  x: window.outerWidth}, 1500).onComplete(()=>{
            this.ship.clear();
        });
        outFromPort.chain(turnToCenter)
        turnToCenter.chain(wayToCenter)
        wayToCenter.chain(turnToExit)
        turnToExit.chain(wayToExit)
        wayToExit.chain(goAway)
        outFromPort.start();

    }

    get getType(){
        return this.type
    }

    private step():void {
        requestAnimationFrame(()=>this.step())
        TWEEN.update()
    }
}
