/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.up = function(knex) {
  return knex.schema.alterTable('chats', function(table) {
    table.integer('user_id').unsigned().nullable().alter();
  });
};

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.down = function(knex) {
  return knex.schema.alterTable('chats', function(table) {
    table.integer('user_id').unsigned().notNullable().alter();
  });
};