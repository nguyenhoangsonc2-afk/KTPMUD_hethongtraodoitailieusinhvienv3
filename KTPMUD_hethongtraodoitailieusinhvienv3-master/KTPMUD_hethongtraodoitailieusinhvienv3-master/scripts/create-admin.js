// Tạo (hoặc nâng quyền) tài khoản quản trị viên.
// Dùng:  node scripts/create-admin.js <email> <mật_khẩu> "<Họ tên>"
//   - Email chưa có  -> tạo mới tài khoản admin.
//   - Email đã có    -> nâng lên admin (và đặt lại mật khẩu nếu truyền mật khẩu).
// Nên chạy khi server đang tắt hoặc đang chạy đều được (SQLite).
const path = require("path");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const [emailArg, password, nameArg] = process.argv.slice(2);
if (!emailArg || !password) {
  console.error('Cách dùng: node scripts/create-admin.js <email> <mật_khẩu> "<Họ tên>"');
  process.exit(1);
}
const email = emailArg.trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { console.error("Email không hợp lệ."); process.exit(1); }
if (password.length < 8) { console.error("Mật khẩu phải có ít nhất 8 ký tự."); process.exit(1); }
const name = (nameArg || "Quản trị viên").trim().slice(0, 100);

// Cùng định dạng với hashPassword() trong server.js
function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(pw, salt, 64);
  return `scrypt$${salt.toString("hex")}$${h.toString("hex")}`;
}

const db = new Database(path.join(__dirname, "..", "data", "campus_exchange.db"));
const hash = hashPassword(password);
const existing = db.prepare("SELECT id FROM users WHERE email=?").get(email);
if (existing) {
  db.prepare("UPDATE users SET role='admin', status='active', email_verified=1, password_hash=? WHERE id=?").run(hash, existing.id);
  console.log(`Đã nâng tài khoản ${email} (id=${existing.id}) lên quản trị viên và đặt lại mật khẩu.`);
} else {
  const info = db.prepare(`INSERT INTO users(name,email,faculty,rating,review_count,role,status,email_verified,password_hash)
    VALUES(?,?,?,?,?,'admin','active',1,?)`).run(name, email, "Quản trị", 5, 0, hash);
  console.log(`Đã tạo quản trị viên ${email} (id=${info.lastInsertRowid}).`);
}
db.close();
