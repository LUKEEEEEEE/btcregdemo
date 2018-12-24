import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {BtcInTx} from "./BtcInTx";

@Entity()
export class BtcTransaction {

    @PrimaryGeneratedColumn()
    public id: Number;

    @Column()
    public address: String;

    @Column()
    public amount: Number;

    @Column()
    public confirmations: Number;

    @Column()
    public blockhash: String;

    @Column()
    public blocktime: Number;

    @Column()
    public txid: String;

    @Column()
    public label: String = "";

    @OneToMany(type => BtcInTx, (btcInTx:BtcInTx) => btcInTx.outtx)
    public intxs: BtcInTx[];

    constructor(tx) {
        if (!tx) return;
        this.address = tx.address;
        this.amount = tx.amount;
        this.confirmations = tx.confirmations;
        this.blockhash = tx.blockhash;
        this.blocktime = tx.blocktime;
        this.txid = tx.txid;
        if (tx.label) this.label = tx.label;
    }
}