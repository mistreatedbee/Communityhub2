import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const [emailArg, passwordArg, fullNameArg] = process.argv.slice(2);
const email = String(emailArg || '').trim().toLowerCase();
const password = String(passwordArg || '').trim();
const fullName = String(fullNameArg || 'Super Admin').trim() || 'Super Admin';

if (!email || !password) {
  console.error('Usage: node scripts/ensure-super-admin-mongo.mjs <email> <password> [full_name]');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('Missing MONGODB_URI');
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    full_name: { type: String, default: null },
    password_hash: { type: String, required: true },
    platform_role: { type: String, enum: ['user', 'super_admin'], default: 'user' },
    memberships: { type: Array, default: [] }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const UserModel = mongoose.models.User || mongoose.model('User', userSchema, 'users');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await UserModel.findOne({ email });
  const passwordHash = await bcrypt.hash(password, 12);

  if (!existing) {
    const created = await UserModel.create({
      email,
      full_name: fullName,
      password_hash: passwordHash,
      platform_role: 'super_admin',
      memberships: []
    });
    console.log(`Created Mongo super admin: ${created.email} (${created._id})`);
  } else {
    existing.full_name = fullName;
    existing.password_hash = passwordHash;
    existing.platform_role = 'super_admin';
    await existing.save();
    console.log(`Updated Mongo super admin: ${existing.email} (${existing._id})`);
  }

  const verify = await UserModel.findOne({ email }).select('_id email platform_role').lean();
  console.log(verify);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Failed:', err.message || err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
