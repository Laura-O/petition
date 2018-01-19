const redis = require("redis");
const client = redis.createClient(process.env.REDIS_URL || { host: "localhost", port: 6379 });

client.on("error", function(err) {
    console.log(err);
});

function get(key) {
    return new Promise(function(resolve, reject) {
        client.get(key, function(err, data) {
            err ? reject(err) : resolve(data);
        });
    });
}

function set(key, value) {
    return new Promise(function(resolve, reject) {
        client.set(key, value, function(err, data) {
            err ? reject(err) : resolve(data);
        });
    });
}

function del(key) {
    return new Promise(function(resolve, reject) {
        client.del(key, function(err, data) {
            err ? reject(err) : resolve(data);
        });
    });
}

function setex(key, time, value) {
    return new Promise(function(resolve, reject) {
        client.setex(key, time, value, function(err, data) {
            err ? reject(err) : resolve(data);
        });
    });
}

module.exports = { get, set, del, setex };
