import app from './app';
import "reflect-metadata";
import {createConnection} from "typeorm";
import {BtcTransaction} from "./entity/BtcTransaction";
import {BtcInTx} from './entity/BtcInTx';


let mysql = require('mysql');
let mysql_connection_conf = {
    host: "db",
    port: "3306",
    user: "root",
    password: "rootpass"
};

let is_db_created = false;
while (!is_db_created) {
    let con = mysql.createConnection(mysql_connection_conf);
    con.connect((err) => {
        if (err) return;
        console.log("[CONNECTED]");
        con.query("CREATE DATABASE btctx", (err, result) => {
            (!err)
                ? console.log("[DATABASE CREATED]")
                : console.log("[DATABASE ALREADY CREATED]");
            is_db_created = true;
        });
        con.end();
    });
    require('deasync').sleep(5000);
    console.warn("[RECONNECTING]")
}

createConnection({
    type: "mysql",
    host: "db",
    port: 3306,
    username: "root",
    password: "rootpass",
    database: "btctx",
    entities: [
        BtcTransaction,
        BtcInTx
    ],
    synchronize: true,
    logging: false
}).then(connection => {
    console.log("[ORM LOADED, ENTITIES SCANNED]")
}).catch(error => {
    console.log("[ERROR LOADING ORM]");
    console.error(error);
});

const port = process.env.PORT || 3000;

app.listen(port, (err) => {
    return err
        ? console.log(err)
        : console.log(`server is listening on ${port}`);
});