/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.string('conversation_id');
  });
};

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('conversation_id');
  });
};
