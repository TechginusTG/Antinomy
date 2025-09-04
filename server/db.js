import knex from 'knex';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const knexConfig = require('../knexfile.cjs');

const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

export default db;
