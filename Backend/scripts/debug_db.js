const dns = require('dns').promises;
const net = require('net');
require('dotenv').config();

async function debugDB() {
    console.log("--- 🕵️ MongoDB Connection Debugger ---");
    console.log(`Node Version: ${process.version}`);
    
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error("❌ MONGO_URI is not defined in .env");
        return;
    }

    // 1. Parse hostname
    let hostname;
    try {
        if (uri.startsWith('mongodb+srv://')) {
            hostname = uri.split('@')[1].split('/')[0];
        } else {
            hostname = uri.split('@')[1].split(':')[0];
        }
        console.log(`📍 Target Host: ${hostname}`);
    } catch (e) {
        console.error("❌ Failed to parse hostname from URI");
    }

    // 2. DNS Lookup (SRV)
    if (uri.startsWith('mongodb+srv://')) {
        console.log("🔍 Checking SRV Records...");
        try {
            const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${hostname}`);
            console.log("✅ SRV Records Found:", srvRecords);
        } catch (err) {
            console.error(`❌ SRV Resolution Failed: ${err.message}`);
            console.log("💡 Tip: This often means your DNS provider (ISP) is blocking SRV lookups.");
        }
    }

    // 3. DNS Lookup (A Record)
    console.log("🔍 Checking A/AAAA Records...");
    try {
        const addresses = await dns.lookup(hostname);
        console.log(`✅ Host resolved to: ${addresses.address}`);
    } catch (err) {
        console.error(`❌ DNS Lookup Failed: ${err.message}`);
    }

    // 4. Port Check (27017)
    console.log("🔍 Checking Port 27017 Connectivity...");
    const socket = new net.Socket();
    socket.setTimeout(5000);
    socket.on('connect', () => {
        console.log("✅ Connection to Port 27017 successful!");
        socket.destroy();
    }).on('timeout', () => {
        console.error("❌ Connection Timeout: Port 27017 might be blocked by a firewall.");
        socket.destroy();
    }).on('error', (err) => {
        console.error(`❌ Port Connection Failed: ${err.message}`);
    }).connect(27017, hostname);
}

debugDB();
