import {BtcTransaction} from "../entity/BtcTransaction";
import {getConnection} from "typeorm";
import {StaticFunctions} from "../config";
import * as request from 'request';
import {BtcInTx} from "../entity/BtcInTx";

export class TransactionHandler {

    private btc_tx: BtcTransaction;

    constructor(btc_tx) {
        this.btc_tx = new BtcTransaction(btc_tx);
    }

    async find_in_txs_and_save() {
        let raw_tx = await this.get_raw_tx();
        let btc_tx_inputs = await this.decode_raw_tx(raw_tx['result']['hex']);
        let inputs = btc_tx_inputs['result']['vin'];

        if (inputs.length == 0 || inputs[0]["coinbase"]) {
            // coinbase tx
            ;;
        } else {
            let btc_in_txs: Array<BtcInTx> = [];
            for (let tx of inputs) {
                getConnection().manager.save(new BtcInTx(tx, this.btc_tx.txid))
            }
        }
        this.save();
    }

    private async get_raw_tx() {
        const options = StaticFunctions.get_http_options({
            "method": "gettransaction",
            "params": [this.btc_tx.txid]
        });
        return new Promise((resolve, reject) => {
            request(options, (err, res, body) => {
                if (err) reject(err);
                resolve(body)
            })
        });
    }

    private async decode_raw_tx(hex: String) {
        const options = StaticFunctions.get_http_options({
            "method": "decoderawtransaction",
            "params": [hex]
        });
        return new Promise((resolve, reject) => {
            request(options, (err, res, body) => {
                if (err) reject(err);
                resolve(body)
            })
        });
    }

    public save() {
        getConnection().manager.save(this.btc_tx);
    }
}