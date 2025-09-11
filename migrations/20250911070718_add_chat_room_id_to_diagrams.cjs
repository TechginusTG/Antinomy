exports.up = function(knex) {
  return knex.schema.alterTable('diagrams', function(table) {
    table.uuid('chat_room_id').references('id').inTable('chat_rooms').onDelete('CASCADE');
    table.unique(['user_id', 'chat_room_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('diagrams', function(table) {
    table.dropUnique(['user_id', 'chat_room_id']);
    table.dropColumn('chat_room_id');
  });
};
