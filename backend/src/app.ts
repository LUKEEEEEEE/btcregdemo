import * as express from 'express'
import * as cors from 'cors';
import * as request from 'request';
import {getConnection} from "typeorm";
import {BtcTransaction} from "./entity/BtcTransaction";
import {StaticFunctions} from './config';
import * as _ from 'lodash';
import {TransactionHandler} from "./logic/TransactionHandler";


enum AddressTypes {
    BECH_32 = "bech32",
    STANDARD = ""
}

class App {
    public express;

    private last_block_parsed: String = "";

    constructor () {
        this.express = express();
        this.express.use(cors());
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

        // huh, idk ??
        router.get('/list_transactions', async (req, res) => {
            await this.sync_blockchain_to_mysql();
            let txes = await getConnection().manager.find(BtcTransaction);
            return res.json({});
        });

        router.get('/send_bitcoins', async (req, res) => {
            console.log(1);
            let out = await this.send_bitcoins(req.query.address, parseFloat(req.query.amount));
            return res.json(out);
        });

        router.get('/generate_bitcoins', async (req, res) => {
            let out = await this.generate_bitcoins(parseInt(req.query.count));
            return res.json(out);
        });

        router.get('/ping', async (req, res) => {
            let out = {"msg": "pong"};
            return res.json(out);
        });


        this.express.use('/', router);
    }

    private async sync_blockchain_to_mysql() {
        let params = [];
        if (this.last_block_parsed) {
            params = [this.last_block_parsed]
        }
        const options = StaticFunctions.get_http_options({
            "method": "listsinceblock",
            "params": params
        });
        return new Promise((resolve, reject) => {
            request(options, async (err, res, body) => {
                if (err) reject(err);
                let out = {};
                if (!body.result) {
                    resolve(out);
                    return;
                }

                // new block was mined. Store all tx to db
                const transactions = body.result['transactions'];
                if (transactions.length == 0) {
                    resolve(out);
                    return;
                }
                const last_block = _.maxBy(transactions, (tx) => tx['blocktime']);
                this.last_block_parsed = last_block['blockhash'];
                out = transactions;
                let counter = 0;
                for (let tx of transactions) {
                    let transaction_handler = new TransactionHandler(tx);
                    await transaction_handler.find_in_txs_and_save();

                    // In case of 2 many tx, we need to manage worker queue depth. This is bad but simple workaround.
                    counter = counter + 1;
                    if (counter % 10 == 0)
                        require('deasync').sleep(500);
                }
                resolve(out)
            })
        });
    }

    private async generate_bitcoins(count: number) {
        const options = StaticFunctions.get_http_options({
            "method": "generate",
            "params": [count]
        });

        return new Promise((resolve, reject) => {
                request(options, (err, res, body) => {
                    if (err) reject(err);
                    resolve(body.result);
                })
            });
    }


    private async new_account(address_type: AddressTypes = AddressTypes.BECH_32) {
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

    private async get_balances_by_address() {
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

    private send_bitcoins(address: String, amount: number) {
        const options = StaticFunctions.get_http_options({
            "method": "sendtoaddress",
            "params": [address, amount]
        });
        console.log(options);
        return new Promise((resolve, reject) => {
            request(options, (err, res, body) => {
                if (err) reject(err);
                resolve(body)
            })
        });
    }
}

export default new App().express;