'use strict';

exports.up = function(knex) {
  // 1. chat_room_id가 없는 데이터 먼저 삭제
  return knex('diagrams').whereNull('chat_room_id').del()
    .then(function() {
      // 2. 테이블 스키마 변경
      return knex.schema.alterTable('diagrams', function(table) {
        // 기존의 잘못된 기본 키 삭제
        table.dropPrimary('diagrams_pkey');
        // 불필요해진 고유 제약 삭제
        table.dropUnique(['user_id', 'chat_room_id']);
        // (user_id, chat_room_id)를 올바른 기본 키로 설정
        table.primary(['user_id', 'chat_room_id']);
      });
    });
};

exports.down = function(knex) {
  return knex.schema.alterTable('diagrams', function(table) {
    // 수정된 기본 키 삭제
    table.dropPrimary();
    // 이전의 고유 제약 복원
    table.unique(['user_id', 'chat_room_id']);
    // 맨 처음의 기본 키 복원
    table.primary('user_id', 'diagrams_pkey');
  });
};
