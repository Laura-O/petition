const Pool = require("pg-pool");

const config = {
    host: "localhost",
    port: 5432,
    database: "petition",
};

const pool = new Pool(config);
pool.on("error", err => {
    console.log(err);
});

const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        pool.connect().then(client => {
            client
                .query(sql, params)
                .then(results => {
                    resolve(results);
                    client.release();
                })
                .catch(e => {
                    reject(e);
                    client.release();
                    console.error("query error", e.message, e.stack);
                });
        });
    });
};

module.exports = {
    query: query,
    pool: pool,
};
