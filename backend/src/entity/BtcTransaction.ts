import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class BtcTransaction {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public address: String;

    @Column()
    public amount: Number;

    @Column()
    public confirmations: Number;

    @Column()
    public generated: Boolean;

    @Column()
    public blockhash: String;

    @Column()
    public blocktime: Number;

    @Column()
    public txid: String;
}