// Script untuk melakukan sync model Sequelize ke database.
// Gunakan dengan hati-hati: opsi force akan DROP lalu CREATE ulang tabel.
// Jalankan: `npm run sync` (default alter) atau `SYNC_MODE=force npm run sync`.

require("dotenv").config();
const db = require("./database");
const initModels = require("../models/init-models");

(async () => {
  try {
    console.log("[sync] Menghubungkan ke database...");
    await db.authenticate();
    console.log("[sync] Koneksi OK");

    // Inisialisasi semua model & relasi
    initModels(db);

    // Mode sync: alter (default) atau force via env SYNC_MODE
    const mode = process.env.SYNC_MODE;
    const syncOptions = mode === "force" ? { force: true } : { alter: true };
    console.log(`[sync] Menjalankan sequelize.sync dengan opsi: ${JSON.stringify(syncOptions)}`);
    await db.sync(syncOptions);
    console.log("[sync] Sinkronisasi selesai");
  } catch (err) {
    console.error("[sync] Gagal:", err);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
})();
