module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './server/dev.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};