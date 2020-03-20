



const evalInterval = 100;
const songQueueLen = 10;

const youtubedl = require('youtube-dl');
const fs = require('fs');
const musicFolder = "/music";

class DJ {
    constructor() {
        this.songQueue = [];
        this.skips = 0;

        this.voted={};
    }
    async setClient(client,MUSIC_CHANNEL_ID) {
        this.discordClient = client;
        this.channel = await client.channels.fetch(MUSIC_CHANNEL_ID);
        this.channel.join().then((connection) => {
            this.musicCon = connection;
            
        }).catch(console.log);



    }
    voteSkip(user) {
        if (this.songQueue.length > 0 && !(user in this.voted)) {
            this.voted[user]=true;
            if(++this.skips/(this.channel.members.size-1)>0.6)
                this.skip();
        }
    }
    skip() {
        console.log("Skipping");

        this.songQueue[0].dispatcher.destroy();
        this.songQueue.shift();
        this.playNextSong();
    }
    playNextSong() {
        if (this.songQueue.length != 0) {

    
            this.skips = 0;
            this.voted={};


            let currentSong = this.songQueue[0];
            let readStream=fs.createReadStream(currentSong.filepath);
            let dispatcher = this.musicCon.play(readStream);

            currentSong.dispatcher = dispatcher;

            dispatcher.on('error', (err) => {
                console.log(err);

                try {
                    fs.unlink(currentSong.filepath);
                }
                catch (err) {
                    console.error(err);
                }
                readStream.close();
                this.songQueue.shift();
                currentSong.dispatcher.destroy();
                this.playNextSong();
            });
            dispatcher.on('finish', () => {

                readStream.close();
                this.songQueue.shift();
                currentSong.dispatcher.destroy();
                this.playNextSong();
            })

        }
    }
    addSong(req) {

        let songData = {};
        if (this.songQueue.length < songQueueLen) {


            youtubedl.getInfo(`ytsearch1:${req.name}`, [], (err, info) => {
                if (err)
                    throw err;

                songData.id = info.id;
                songData.filepath = __dirname + musicFolder + "/" + songData.id;

                if (!fs.existsSync(songData.filepath)) {
                    const video = youtubedl(info.id, ['--extract-audio'], { cwd: __dirname + musicFolder });
                    let writeStream=fs.createWriteStream(songData.filepath);
                    video.pipe(writeStream);

                    video.on('error', (err) => {
                        console.error(`Error downloading video\n${err}`);

                        fs.unlink(songData.filepath);
                    });
                    video.on('end', () => {
                        this.songQueue.push(songData);
                        console.log(`Finished downloading!`);

                        video.unpipe(writeStream);
                        writeStream.end();
                        
                        //If first song in queue, play 
                        console.log(this.songQueue.length);
                        if (this.songQueue.length === 1)
                            this.playNextSong();
                        else
                            console.log("Song added to queue");


                    });

                }
                else {

                    this.songQueue.push(songData);
                    console.log(`File already present`);

                    //If first song in queue, play 
                    console.log(this.songQueue.length);
                    if (this.songQueue.length === 1)
                        this.playNextSong();
                }
            }
            );

        }
        else
            console.log("Queue full");
    }
}

module.exports = { DJ };