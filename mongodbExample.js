// mongodbExample.js

const { MongoClient, ObjectId } = require('mongodb');

// Ensure you have the mongodb and dotenv packages installed:
// npm install mongodb dotenv
//
// We use dotenv to load the MONGODB_URI from a .env file in the same directory,
// which acts as our configuration file fallback if it's not in the environment.
require('dotenv').config();

// Read MONGODB_URI from environment variables.
// Note: You must set this variable before running the script.
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Error: MONGODB_URI environment variable not set.");
  console.error("Please create a .env file with MONGODB_URI=your_cluster_uri or set it in your terminal.");
  process.exit(1);
}

// Initialize the MongoDB client
const client = new MongoClient(uri);

async function run() {
  try {
    // Connect to MongoDB Atlas
    console.log("Connecting to MongoDB Atlas...");
    await client.connect();
    console.log("Connected successfully!\n");

    // Choose appropriate database and collection names for an Audit Log application
    const database = client.db('security_audit_db');
    const logsCollection = database.collection('system_logs');

    // 1. Insert 10 realistic documents with different timestamp values
    console.log("Preparing to insert 10 audit log documents...");
    
    // We will generate 10 logs spaced out by 1 hour each
    const now = new Date();
    const mockLogs = [];
    
    for (let i = 0; i < 10; i++) {
        // Subtract hours extending into the past
        const pastDate = new Date(now.getTime() - (10 - i) * 60 * 60 * 1000); 
        
        mockLogs.push({
            action: i % 3 === 0 ? 'DATA_EXPORT' : 'USER_LOGIN',
            userId: `admin_user_${i + 1}`,
            targetResource: i % 3 === 0 ? '/api/reports/financial' : '/auth/login',
            status: i === 4 ? 'FAILURE' : 'SUCCESS',    // Simulate one failure
            ipAddress: `192.168.1.${100 + i}`,
            timestamp: pastDate,
            metadata: {
                browser: 'Chrome',
                os: 'Windows'
            }
        });
    }

    // Perform the bulk insertion
    const insertResult = await logsCollection.insertMany(mockLogs);
    console.log(`Successfully inserted ${insertResult.insertedCount} audit logs.\n`);

    // 2. Read and print the 5 most recent documents, sorting by timestamp (descending)
    console.log("Fetching the 5 most recent audit logs (sorted by timestamp)...");
    
    const recentLogs = await logsCollection
        .find({})
        .sort({ timestamp: -1 }) // -1 specifies descending order (newest first)
        .limit(5)
        .toArray();
        
    recentLogs.forEach((log, index) => {
        console.log(`${index + 1}. [${log.timestamp.toISOString()}] ${log.action} by ${log.userId} - Status: ${log.status}`);
    });
    console.log();

    // 3. Read and print one full document by its _id
    if (recentLogs.length > 0) {
        // Grab the _id from the first document in our recent logs array
        const targetId = recentLogs[0]._id;
        console.log(`Fetching full details for document with _id: ${targetId}...`);
        
        // Query the database explicitly matching the ObjectId
        const singleDoc = await logsCollection.findOne({ _id: new ObjectId(targetId) });
        
        console.log("Document details:");
        console.log(JSON.stringify(singleDoc, null, 2));
    }

  } catch (error) {
    // Simple error handling for connection and query failures
    console.error("An error occurred during MongoDB operations:", error.message);
  } finally {
    // 4. Always close the MongoDB connection when finished
    console.log("\nClosing MongoDB connection...");
    await client.close();
    console.log("Connection closed.");
  }
}

// Execute the main function
run().catch(console.dir);
