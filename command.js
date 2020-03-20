const command_prefix = '!';

function argParse(str)
{
    let ret=[""];
    let delimeter=' ';
    let wIx=0;
    //return str.matchAll(/(["'])(?:(?=(\\?))\2.)*?\1|(\b\S+\b)/g);
    return [...str.matchAll(/"(.*?)"|(\b\S+\b)/g)].map(elm=>{
        if(elm[1]==undefined)
            return elm[0];
        else 
            return elm[1];
    });
}
class Command {
    constructor(name, format, exec) {
        this.name = name;
        this.exec = exec;
        this.format = format;

        this.usageStr=name;

        for(let i=0;i<format.length; i++)
            this.usageStr+=` <${format[i]}>`;
        console.log(this.usageStr);
    }
}
class CommandHandler {
    constructor() {
        this.commands = {};
    }
    addCommand(c) {
        for (let command in this.commands) {
            if (command == c.name)
            {
                console.log("Failed to add command. Command with same name exists");
                break;
            }
        }
        this.commands[c.name]=c;
    }
    processCommand(commandString, message) {
        commandString=commandString.trim();
        if (commandString[0] === '!') {
            commandString=commandString.substring(1);
            //console.log(`Received command "${commandString}"`);
            let command = argParse(commandString);
            let commandName = command[0];

            //console.log(`Command name: ${commandName}`);

            if (commandName in this.commands) {
                let currentCommand = this.commands[commandName];
                if (currentCommand.format.length != command.length - 1)
                    message.channel.send(`${message.author} Command usage: ${currentCommand.usageStr}`);
                else {
                    let paramList = {};
                    for (let i=0;i<currentCommand.format.length;i++)
                        paramList[ currentCommand.format[i] ] = command[i+1];

                    currentCommand.exec(message, paramList);
                }
            }
        }

    }
}
module.exports={CommandHandler,Command};