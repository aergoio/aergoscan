import aergo from './aergo';
import { EventEmitter } from 'events';

export default class BlockTracker extends EventEmitter {
    constructor() {
        super();
        this.stream = null;
    }

    start() {
        this.stop();
        console.log('Connecting to block stream...');
        this.stream = aergo.getBlockStream();
        this.stream.on('data', (blockHeader) => {
            const block = blockHeader.toObject();
            this.emit('block', block);
        }).on('end', (res) => {
            console.log('Block stream ended, trying to reconnect in 5 seconds...');
            setTimeout(() => {
                this.start();
            }, 5000);
        });
    }

    stop() {
        if (this.stream) {
            this.stream.cancel();
        }
    }
}