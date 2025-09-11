exports.up = function(knex) {
  return knex.schema.createTable('chat_rooms', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.integer('user_id').unsigned().references('user_id').inTable('users').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.timestamps(true, true);
  })
  .then(function() {
    return knex.schema.alterTable('users', function(table) {
      table.dropColumn('conversation_id');
    });
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.uuid('conversation_id');
  })
  .then(function() {
    return knex.schema.dropTableIfExists('chat_rooms');
  });
};
