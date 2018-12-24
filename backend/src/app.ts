import * as express from 'express'
import * as request from 'request';
import {createConnection, getConnection} from "typeorm";
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
            let txes = await getConnection().manager.find(BtcTransaction);
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
        const options = StaticFunctions.get_http_options({
            "method": "sendtoaddress",
            "params": [address, amount]
        });
        return new Promise((resolve, reject) => {
            request(options, (err, res, body) => {
                if (err) reject(err);
                resolve(body)
            })
        });
    }
}

export default new App().express;