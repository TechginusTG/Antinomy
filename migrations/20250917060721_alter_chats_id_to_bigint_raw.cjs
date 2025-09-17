/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.up = function(knex) {
  return knex.schema.raw('ALTER TABLE chats ALTER COLUMN id TYPE BIGINT USING id::bigint;');
};

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.down = function(knex) {
  return knex.schema.raw('ALTER TABLE chats ALTER COLUMN id TYPE INTEGER USING id::integer;');
};