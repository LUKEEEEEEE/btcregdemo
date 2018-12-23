import app from './App';
import "reflect-metadata";
import {createConnection} from "typeorm";

import {BtcTransaction} from "./entity/BtcTransaction";

let mysql = require('mysql');

let con = mysql.createConnection({
    host: "localhost",
    port: "5306",
    user: "root",
    password: "rootpass"
});



con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
    // silently ignore error if db already created! This deserves better error handling!
        con.query("CREATE DATABASE btctx", (err, result) => {
            (!err)
                ? console.log("Database created")
                : console.log("DATABASE ALREADY CREATED");
        })
});


createConnection({
    type: "mysql",
    host: "localhost",
    port: 5306,
    username: "root",
    password: "rootpass",
    database: "btctx",
    entities: [
        BtcTransaction
    ],
    synchronize: true,
    logging: false
}).then(connection => {
    console.log("ORM LOADED, ENTITIES SCANNED")
}).catch(error => console.log(error));

const port = process.env.PORT || 3000;

app.listen(port, (err) => {
    return err
        ? console.log(err)
        : console.log(`server is listening on ${port}`);
});