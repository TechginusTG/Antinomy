const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Hash the password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Inserts seed entries
  await knex('users').insert([
    {
      id: 'test',
      password: hashedPassword, // Store the hashed password
      name: '테스트 사용자',
      lvl: 1,
      exp: 0
    }
  ]);
};