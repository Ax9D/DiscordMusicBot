process.env.UV_THREADPOOL_SIZE = 128;

const discord= require("discord.js");
const fs=require("fs");
const dj= require("./dj.js");
const cmd= require("./command.js");

const {auth_token,MUSIC_CHANNEL_ID}=JSON.parse(fs.readFileSync("auth.json").toString().replace(/[^ -~]+/g,""));

const client=new discord.Client();

const commandHandler=new cmd.CommandHandler();

const dJ=new dj.DJ();

commandHandler.addCommand(new cmd.Command("echo",["str"],(message,paramList)=>{
    message.channel.send(`${message.author} ${paramList.str}`);
}));
commandHandler.addCommand(new cmd.Command("dare",[],(message,paramList)=>{
    message.channel.send(`${message.author} Boku wa priveleged inu desu. Yorushiku onegai shimasu. More functionality will be added soon...`);
}));
commandHandler.addCommand(new cmd.Command("sr",['name'],(message,paramList)=>{
    dJ.addSong({'name':paramList.name,
                        'message':message});
}));
commandHandler.addCommand(new cmd.Command("skip",[],(message,paramList)=>{
    dJ.voteSkip(message.author.id);
}));

client.on('ready',()=>{
    console.log("Bot awoken");
    dJ.setClient(client,MUSIC_CHANNEL_ID).then(()=>{

        client.on('message',msg=>{
            commandHandler.processCommand(msg.content,msg);
        });

    });
});
client.login(auth_token).catch((err)=>{
    console.log(err);
});
