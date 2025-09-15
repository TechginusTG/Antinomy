/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('liked_chats', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.integer('chat_id').unsigned().notNullable().references('id').inTable('chats').onDelete('CASCADE');
    table.string('mode').notNullable();
    table.timestamps(true, true);
  }).then(() => {
    return knex.schema.table('users', table => {
      table.jsonb('keyword_preferences').notNullable().defaultTo('{}');
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('liked_chats')
    .then(() => {
      return knex.schema.table('users', table => {
        table.dropColumn('keyword_preferences');
      });
    });
};