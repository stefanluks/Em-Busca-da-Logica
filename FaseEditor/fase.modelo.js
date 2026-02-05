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
        let toString = `{`
        for (const [key, value] of Object.entries(this)) {
            if(key == "walls"){
                toString += `\n${key}:[`;
                for(let pos of value){
                    toString += `{x: ${pos.x},y:${pos.y}},`;
                }
                toString += `],`;
            }else if(key == "allowedCommands"){
                console.log(key, value)
                toString += `\n${key}:[`;
                for(let i of value){
                    toString += `"${i}",`;
                }
                toString += `],`;
            }else if (isNaN(value)){
                toString += `\n${key}: "${value}",`;
            }else{
                toString += `\n${key}: ${value},`;
            }
        }
        toString += `}`
        console.log(toString);
        return toString;
    }
}