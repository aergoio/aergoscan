import aergo from './aergo';
import { EventEmitter } from 'events';

export default class BlockTracker extends EventEmitter {
    constructor() {
        super();
        this.stream = null;
        this.lastBlock = + new Date();
    }

    start() {
        this.stop();

        setTimeout(() => {
            this.check();
        }, 10000);

        console.log('Connecting to block stream...');
        this.stream = aergo.getBlockStream();
        this.stream.on('data', (blockHeader) => {
            this.emit('block', blockHeader);
            this.lastBlock = + new Date();
        }).on('end', (res) => {
            console.log('Block stream ended, trying to reconnect in 5 seconds...');
            setTimeout(() => {
                this.start();
            }, 5000);
        });
    }

    check() {
        if ((new Date() - this.lastBlock) > 30000) {
            // Something's wrong, maybe the stream is down? Try to restart.
            console.log('Block stream appears to be down, trying to reconnect...');
            this.start();
        } else {
            setTimeout(() => {
                this.check();
            }, 10000);
        }
    }

    stop() {
        if (this.stream) {
            this.stream.cancel();
        }
    }
}