/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.up = function(knex) {
  return knex.schema.createTable('chats', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('user_id').inTable('users').onDelete('CASCADE');
    table.text('message').notNullable();
    table.string('sender').notNullable();
    table.string('conversation_id').notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.down = function(knex) {
  return knex.schema.dropTable('chats');
};