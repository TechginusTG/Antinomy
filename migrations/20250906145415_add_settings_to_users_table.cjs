exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.string('theme').defaultTo('light');
    table.jsonb('custom_theme_colors');
    table.string('mode').defaultTo('basic');
    table.text('user_note');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('theme');
    table.dropColumn('custom_theme_colors');
    table.dropColumn('mode');
    table.dropColumn('user_note');
  });
};