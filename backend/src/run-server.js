import app from './app';
import cfg from './config';

const startup = async () => {
    app.listen(cfg.HTTP_PORT, () => console.log(`Backend listening on port ${cfg.HTTP_PORT}.`))
}

console.log('Server started at ' + new Date());
startup();
