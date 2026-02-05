export default class Fase {
    constructor(nome, descricao){
        this.name = nome;
        this.description = descricao;
        this.grid = 8;
        this.tileSize = 60;
        this.startX = 1;                      
        this.startY = 1;                    
        this.startDir = 0;                    
        this.goalX = 6;                       
        this.goalY = 1;                      
        this.walls = [];                     
        this.allowedCommands = ['forward', 'left', 'right'];
        this.commandLimit = null;           
        this.minimalCommands = 5;             
    }

    setStart(x, y){
        this.startX = x;
        this.startY = y;
    }

    setGoal(x, y){
        this.goalX = x;
        this.goalY = y;
    }

    json(){
        return JSON.stringify(this, null, 2);
    }

    getObj(){
        console.log(this)
        let toString = `{`
        for (const [key, value] of Object.entries(this)) {
            if(key == "walls"){
                toString += `[`;
                for(let pos of value){
                    toString += `{x: ${pos.x},y:${pos.y}}`;
                }
                toString += `]`;
            }else{
                toString += `\n${key}: ${value},`;
            }
        }
        toString += `}`
        return toString;
    }
}