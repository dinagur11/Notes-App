import mongoose from 'mongoose';
import dns from 'node:dns';

// Force Node's resolver to use Google/Cloudflare DNS instead of whatever
// virtual-adapter nameserver Windows handed it (the cause of querySrv ECONNREFUSED).
dns.setServers(['8.8.8.8', '1.1.1.1']);
// Prefer IPv4 — avoids a known Windows/Node resolution quirk.
dns.setDefaultResultOrder('ipv4first');

const connectDB = async (): Promise<void> => {
  let uri = process.env.MONGODB_CONNECTION_URL;

  if (!uri) {
    console.error('MONGODB_CONNECTION_URL is not defined in .env');
    process.exit(1);
  }

  // Strip stray quotes/whitespace that can sneak in from .env files.
  uri = uri.replace(/^["']|["']$/g, '').trim();

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 4, // force IPv4 inside the driver too
    });
    console.log('MongoDB connected successfully 🚀');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;