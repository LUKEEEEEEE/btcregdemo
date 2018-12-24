import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {BtcTransaction} from "./BtcTransaction";

@Entity()
export class BtcInTx {

    @PrimaryGeneratedColumn()
    public id: Number;

    @Column()
    public txid: String;

    @Column()
    public label: String = "";

    @ManyToOne(type => BtcTransaction, (btcTransaction: BtcTransaction) => btcTransaction.intxs)
    public outtx: BtcTransaction;

    constructor(tx, outtx) {
        if (!tx) return;
        this.txid = tx.txid;
        this.outtx = tx.outtx;
        if (tx.label) this.label = tx.label;
    }
}