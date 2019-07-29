import sqlite3 from 'sqlite3'
import {store} from './store'

export const openCon = () => {
    return new sqlite3.Database(store.state.set.db.file_loc, (err) => {
        if (err) {
            return console.error(err.message);
        }
    });
}

export const commitAllResults = (sql, arg) => {
    let db = openCon();
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        store.commit(arg, rows)
    });
    db.close()
};

