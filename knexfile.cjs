module.exports = {
  development: {
    client: 'pg',
    connection: 'postgresql://postgres:[s5iw1WQZXehzruyp]@[2406:da12:b78:de01:ef3a:88e3:ae16:c76]:5432/postgres',
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};