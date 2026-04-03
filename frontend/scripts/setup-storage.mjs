import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function setupStorage() {
  console.log("🚀 Menyiapkan Storage Supabase...");

  // 1. Create Bucket
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error("❌ Gagal mengambil daftar bucket:", listError.message);
    return;
  }

  const bucketName = "cv-documents";
  const exists = buckets.find(b => b.name === bucketName);

  if (!exists) {
    console.log(`📦 Membuat bucket '${bucketName}'...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: false, // Bucket ini private sesuai PRD
      allowedMimeTypes: ["application/pdf"],
      fileSizeLimit: 5242880 // 5MB
    });

    if (createError) {
      console.error(`❌ Gagal membuat bucket:`, createError.message);
    } else {
      console.log(`✅ Bucket '${bucketName}' berhasil dibuat.`);
    }
  } else {
    console.log(`ℹ️ Bucket '${bucketName}' sudah ada.`);
  }

  console.log("\n🎉 Setup Storage Selesai!");
}

setupStorage();
