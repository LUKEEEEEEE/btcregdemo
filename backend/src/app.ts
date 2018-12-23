import * as express from 'express'
import * as request from 'request';
import {StaticFunctions} from './config';
import * as _ from 'lodash';

enum AddressTypes {
    BECH_32 = "bech32",
    STANDARD = ""
}

class App {
    public express;

    private last_block_parsed: String = "";

    constructor () {
        this.express = express();
        this.mountRoutes();
    }

    private mountRoutes (): void {
        const router = express.Router();
        router.get('/new_account', async (req, res) => {
            let out = await this.new_account(req.query.address_type);
            return res.json(out);
        });

        router.get('/get_balance', async (req, res) => {
            let out = await this.get_balances_by_address();
            return res.json(out);
        });

        router.get('/list_transactions', async (req, res) => {
            await this.sync_blockchain_to_mysql();
            return res.json({});
        });

        router.get('/send_bitcoins', async (req, res) => {
            let out = await this.send_bitcoins(req.query.address, req.query.amount);
            return res.json(out);
        });

        this.express.use('/', router);
    }

    private async sync_blockchain_to_mysql() {
        let params = [];
        if (this.last_block_parsed) {
            params = [this.last_block_parsed, 0]
        }
        const options = StaticFunctions.get_http_options({
            "method": "listsinceblock",
            "params": params
        });

        return new Promise((resolve, reject) => {
            request(options, (err, res, body) => {
                if (err) reject(err);
                let out = {};
                if (body.result) {
                    // new block was mined. Store all tx to db
                    const transactions = body.result['transactions'];
                    const last_block = _.maxBy(transactions, (tx) => tx['blocktime']);
                    console.log(last_block);
                    this.last_block_parsed = last_block['blockhash'];
                    console.log(this.last_block_parsed);
                    out = transactions;
                }
                resolve(out)
            })
        });
    }

    private async new_account(address_type: AddressTypes = AddressTypes.STANDARD) {
        let options = {};
        // maybe just add new field instead of if/else
        if (address_type == AddressTypes.BECH_32) {
            options = StaticFunctions.get_http_options({
                "method": "getnewaddress",
                "params": ["", AddressTypes.BECH_32]
            });
        } else {
            options = StaticFunctions.get_http_options({
                "method": "getnewaddress"
            });
        }
        return new Promise((resolve, reject) => {
            request(options, (err, res, body) => {
                if (err) reject(err);
                resolve(body)
            })
        });
    }

    private async  get_balances_by_address() {
        const options = StaticFunctions.get_http_options({
            "method": "listunspent"
        });
        return new Promise((resolve, reject) => {
                request(options, (err, res, body) => {
                    if (err) reject(err);
                    let out = {};
                    const balances = body.result;
                    for (let tx of balances) {
                        if (out[tx['address']] == undefined) {
                            out[tx['address']] = tx['amount']
                        } else {
                            out[tx['address']] = out[tx['address']] + tx['amount']
                        }
                    }
                    resolve(out)
                })
            });
    }

    private send_bitcoins(address: String, amount: String) {
        console.log(1.1);
        const options = StaticFunctions.get_http_options({
            "method": "sendtoaddress",
            "params": [address, amount]
        });
        return new Promise((resolve, reject) => {
            request(options, (err, res, body) => {
                if (err) reject(err);
                console.log(body);
                resolve(body)
            })
        });
    }
}

export default new App().express;