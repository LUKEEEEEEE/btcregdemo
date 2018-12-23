
const USERNAME = 'someuser';
const PASSWORD = 'somepass';

export class StaticFunctions {
    static get_http_options(body: Object = {}): Object {
        return {
            url: 'http://localhost:5000/',
            method: 'POST',
            json: true,
            headers: {
                Authorization: 'Basic ' + new Buffer(USERNAME + ':' + PASSWORD).toString('base64'),
                'Content-Type': 'application/json'
            },
            body: body
        }
    };

}