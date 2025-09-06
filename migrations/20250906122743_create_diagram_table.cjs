/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.up = function(knex) {
  return knex.schema.createTable('diagrams', function(table) {
    table.integer('user_id').unsigned().notNullable().primary();
    table.foreign('user_id').references('user_id').inTable('users').onDelete('CASCADE');
    table.text('diagram_data');
    table.timestamps(true, true);
  });
};

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.down = function(knex) {
  return knex.schema.dropTable('diagrams');
};