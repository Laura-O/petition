const Pool = require("pg-pool");
const url = require("url");

const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(":");

const config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split("/")[1],
    ssl: true
};

// const config = {
//     host: "localhost",
//     port: 5432,
//     database: "petition",
// };

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
    pool: pool
};
