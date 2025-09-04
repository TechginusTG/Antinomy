exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.integer('lvl').notNullable().defaultTo(1);
    table.integer('exp').notNullable().defaultTo(0);
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('lvl');
    table.dropColumn('exp');
  });
};