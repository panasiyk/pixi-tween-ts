import * as P from 'pixi.js'
import Port from "./lib/Port";
import Building from "./lib/Building";
import Ship from "./lib/Ship";
import {Constant,EVENTS} from './lib/conf/constant';
import TWEEN from 'tween.js'

export default class Main
{
  private static _instance: Main;
  public building: Building;
  public ports: Port [] = [];
  public greenQueue: Ship [] = []
  public redQueue: Ship [] = [];

  public initGame() : void {
    window.addEventListener( EVENTS.WAY_IS_FREE , ()=>this.getFromQueue());
    const app = this.init()
    this.building = new Building(app)
    for (let i = 1; i <= Constant.PORTS_COUNT; i++){
      let port = new Port()
      port.drawPort(app,i)
      this.ports.push(port)
    }
    new Ship(app)
    setInterval(()=>new Ship(app), 8000);
  }

  private getFromQueue(): void{
    for (let i = 0; i < this.ports.length; i++) {
      if(this.ports[i].visitStatus){
        let ship;
        let queue:Ship[]=[];
        if(this.ports[i].isEmpty && this.redQueue.length){
          ship = this.redQueue.shift()
          queue = this.redQueue
        }
        else if (!this.ports[i].isEmpty && this.greenQueue.length) {
          queue = this.greenQueue
          ship = this.greenQueue.shift()
        }
        if(ship){
          ship.swimFromQueue(this.ports[i])
          this.runQueue(queue)
          break;
        }
      }
    }
  }

  private runQueue(queue:Ship[]):void{
    queue.forEach(ship=>{
      new TWEEN.Tween(ship.ship)
          .to({ x: ship.ship.x - ship.width - ship.height }, 2000)
          .onUpdate(function () { ship.ship.x = this.x;})
          .start();
    })

  }

  public pushToQueue(ship:Ship):void{
    ship.getType === Constant.GETTER ? this.greenQueue.push(ship) : this.redQueue.push(ship)
  }

  public getQueue(type:string):Ship []{
    return type === Constant.GETTER ?  this.greenQueue : this.redQueue
  }

  public removeExistingGame() : void {
    const els = document.body.children
    if (els.length > 0) document.body.removeChild(els.item(0) as Node)
  }

  public init() : P.Application {
    this.removeExistingGame()
    const app = new P.Application(
        window.innerWidth
        , window.innerHeight
        , { backgroundColor: 0x0007ff }
    )
    document.body.appendChild(app.view)
    return app
  }

  public static get Instance()
  {
    return this._instance || (this._instance = new this());
  }
}
window.addEventListener('load', ()=>Main.Instance.initGame())
