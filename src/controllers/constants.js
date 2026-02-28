// USUARIOS
const GET_ALL_USERS = "SELECT * FROM pascale_users;";
const GET_USER_BY_ID = "SELECT * FROM pascale_users WHERE user_id = $1;";
const GET_USER_BY_EMAIL = "SELECT * FROM pascale_users WHERE email = $1;";
const CREATE_USER = `INSERT INTO pascale_users (name, lastname, email, password, role, ip, city, country, postal_code)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`;
const UPDATE_USER = "UPDATE pascale_users SET name = $2, lastname = $3, email = $4, updated = $5, updated_at = $6, avatar = $7, city = $8, country = $9, postal_code = $10 WHERE user_id = $1 RETURNING *;";
const UPDATE_PARTIAL_USER = "UPDATE pascale_users SET address = $2, phone = $3, state = $4, updated = $5, updated_at = $6 WHERE user_id = $1 RETURNING *;";
const UPDATE_USER_PASSWORD = "UPDATE pascale_users SET password = $2, updated = $3, updated_at = NOW() WHERE user_id = $1;";
const DELETE_USER = "DELETE FROM pascale_users WHERE user_id = $1 RETURNING *;";
const GET_HERO = "SELECT * FROM user_hero WHERE id = 1;";
const GET_FOOTER = "SELECT * FROM user_footer WHERE id = 1;";
const UPDATE_HERO = "UPDATE user_hero SET updated_at = NOW(), hero_collection = $2, hero_title = $3, hero_subtitle = $4, updated = $5, url_image = $6 WHERE ID = $1 RETURNING *;"
const UPDATE_FOOTER = "UPDATE user_footer SET updated_at = NOW(), title = $2, location = $3, schedule = $4, updated = $5, url_image = $6 WHERE ID = $1 RETURNING *;"

// PRODUCTOS
const GET_ALL_PRODUCTS = "SELECT * FROM products;"
const GET_ALL_PRODUCTS_BY_USER_ID = "SELECT * FROM products WHERE user_id = $1;";
const GET_PRODUCT_BY_ID = "SELECT * FROM products WHERE id = $1;";
const CREATE_PRODUCT = `INSERT INTO products (name, price, stock, condition, image, description, brand, temp, size, color, category, user_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;`;
const UPDATE_PRODUCT = "UPDATE products SET name = $1, price = $2, stock = $3 WHERE id = $4 RETURNING *;";
const DELETE_PRODUCT = "DELETE FROM products WHERE id = $1 RETURNING *;";

export {
  GET_ALL_USERS,
  GET_USER_BY_ID,
  GET_USER_BY_EMAIL,
  CREATE_USER,
  UPDATE_USER,
  UPDATE_PARTIAL_USER,
  UPDATE_USER_PASSWORD,
  DELETE_USER,
  GET_HERO,
  UPDATE_HERO,
  GET_FOOTER,
  UPDATE_FOOTER,
  GET_ALL_PRODUCTS,
  GET_ALL_PRODUCTS_BY_USER_ID,
  GET_PRODUCT_BY_ID,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
};
