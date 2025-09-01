/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.increments('user_id').primary();
        table.string('id', 255).notNullable().unique();
        table.string('password', 255).notNullable();
        table.string('name', 255).notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.down = function(knex) {
    return knex.schema.dropTable('users');
};