const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const Transaction = require('../models/transaction_model');

class TransactionSyncService {
    constructor(sqlConfig) {
        this.sqlConnection = null;
        this.sqlConfig = sqlConfig;
        this.changeStream = null;
    }

    async initSQLConnection() {
        try {
            this.sqlConnection = await mysql.createConnection(this.sqlConfig);
            console.log('Connected to Khedmah SQL database');
        } catch (error) {
            console.error('Failed to connect to SQL database:', error);
            throw error;
        }
    }

    async startChangeStreamWatcher() {
        try {
            // Watch for changes in the transactions collection
            this.changeStream = Transaction.watch([
                {
                    $match: {
                        'operationType': { $in: ['insert', 'update', 'replace'] }
                    }
                }
            ], { fullDocument: 'updateLookup' });

            console.log('Change stream watcher started for transactions');

            this.changeStream.on('change', async (change) => {
                try {
                    await this.handleTransactionChange(change);
                } catch (error) {
                    console.error('Error processing change:', error);
                }
            });

            this.changeStream.on('error', (error) => {
                console.error('Change stream error:', error);
                // Implement reconnection logic here
                setTimeout(() => this.startChangeStreamWatcher(), 5000);
            });

        } catch (error) {
            console.error('Failed to start change stream:', error);
            throw error;
        }
    }

    async handleTransactionChange(change) {
        const { operationType, fullDocument } = change;
        
        if (!fullDocument) {
            console.log('No full document available');
            return;
        }

        const transactionData = this.transformMongoToSQL(fullDocument);

        switch (operationType) {
            case 'insert':
                await this.insertTransaction(transactionData);
                break;
            case 'update':
            case 'replace':
                await this.upsertTransaction(transactionData);
                break;
            default:
                console.log(`Unhandled operation type: ${operationType}`);
        }
    }

    transformMongoToSQL(mongoDoc) {
        return {
            mongo_id: mongoDoc._id.toString(),
            customer_id: mongoDoc.customer_id ? mongoDoc.customer_id.toString() : null,
            coupon_id: mongoDoc.coupon_id ? mongoDoc.coupon_id.toString() : null,
            transaction_type: mongoDoc.transaction_type,
            points: mongoDoc.points,
            transaction_id: mongoDoc.transaction_id,
            point_criteria: mongoDoc.point_criteria ? mongoDoc.point_criteria.toString() : null,
            payment_method: mongoDoc.payment_method,
            status: mongoDoc.status,
            note: mongoDoc.note,
            reference_id: mongoDoc.reference_id,
            app_type: mongoDoc.app_type ? mongoDoc.app_type.toString() : null,
            transaction_date: mongoDoc.transaction_date,
            metadata: JSON.stringify(mongoDoc.metadata || {}),
            created_at: mongoDoc.createdAt,
            updated_at: mongoDoc.updatedAt
        };
    }

    async insertTransaction(data) {
        const query = `
            INSERT INTO transactions (
                mongo_id, customer_id, coupon_id, transaction_type, points,
                transaction_id, point_criteria, payment_method, status, note,
                reference_id, app_type, transaction_date, metadata, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.mongo_id, data.customer_id, data.coupon_id, data.transaction_type,
            data.points, data.transaction_id, data.point_criteria, data.payment_method,
            data.status, data.note, data.reference_id, data.app_type,
            data.transaction_date, data.metadata, data.created_at, data.updated_at
        ];

        try {
            await this.sqlConnection.execute(query, values);
            console.log(`Transaction inserted: ${data.transaction_id}`);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                console.log(`Duplicate entry, updating instead: ${data.transaction_id}`);
                await this.updateTransaction(data);
            } else {
                throw error;
            }
        }
    }

    async upsertTransaction(data) {
        const query = `
            INSERT INTO transactions (
                mongo_id, customer_id, coupon_id, transaction_type, points,
                transaction_id, point_criteria, payment_method, status, note,
                reference_id, app_type, transaction_date, metadata, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                customer_id = VALUES(customer_id),
                coupon_id = VALUES(coupon_id),
                transaction_type = VALUES(transaction_type),
                points = VALUES(points),
                point_criteria = VALUES(point_criteria),
                payment_method = VALUES(payment_method),
                status = VALUES(status),
                note = VALUES(note),
                reference_id = VALUES(reference_id),
                app_type = VALUES(app_type),
                transaction_date = VALUES(transaction_date),
                metadata = VALUES(metadata),
                updated_at = VALUES(updated_at)
        `;

        const values = [
            data.mongo_id, data.customer_id, data.coupon_id, data.transaction_type,
            data.points, data.transaction_id, data.point_criteria, data.payment_method,
            data.status, data.note, data.reference_id, data.app_type,
            data.transaction_date, data.metadata, data.created_at, data.updated_at
        ];

        try {
            await this.sqlConnection.execute(query, values);
            console.log(`Transaction upserted: ${data.transaction_id}`);
        } catch (error) {
            console.error('Error upserting transaction:', error);
            throw error;
        }
    }

    async updateTransaction(data) {
        const query = `
            UPDATE transactions SET
                customer_id = ?, coupon_id = ?, transaction_type = ?, points = ?,
                point_criteria = ?, payment_method = ?, status = ?, note = ?,
                reference_id = ?, app_type = ?, transaction_date = ?, metadata = ?,
                updated_at = ?
            WHERE transaction_id = ?
        `;

        const values = [
            data.customer_id, data.coupon_id, data.transaction_type, data.points,
            data.point_criteria, data.payment_method, data.status, data.note,
            data.reference_id, data.app_type, data.transaction_date, data.metadata,
            data.updated_at, data.transaction_id
        ];

        try {
            const [result] = await this.sqlConnection.execute(query, values);
            console.log(`Transaction updated: ${data.transaction_id}, affected rows: ${result.affectedRows}`);
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    }

    async syncExistingData() {
        console.log('Starting initial sync of existing data...');
        
        const batchSize = 1000;
        let skip = 0;
        let hasMore = true;

        while (hasMore) {
            const transactions = await Transaction.find({})
                .skip(skip)
                .limit(batchSize)
                .lean();

            if (transactions.length === 0) {
                hasMore = false;
                break;
            }

            for (const transaction of transactions) {
                const sqlData = this.transformMongoToSQL(transaction);
                await this.upsertTransaction(sqlData);
            }

            skip += batchSize;
            console.log(`Synced ${skip} transactions so far...`);
        }

        console.log('Initial sync completed');
    }

    async stop() {
        if (this.changeStream) {
            await this.changeStream.close();
        }
        if (this.sqlConnection) {
            await this.sqlConnection.end();
        }
        console.log('Sync service stopped');
    }
}

// Usage example
const sqlConfig = {
    host: 'khedmah-db-host',
    user: 'your-username',
    password: 'your-password',
    database: 'khedmah_db'
};

const syncService = new TransactionSyncService(sqlConfig);

// Start the service
async function startSyncService() {
    try {
        await syncService.initSQLConnection();
        await syncService.syncExistingData(); // Optional: sync existing data
        await syncService.startChangeStreamWatcher();
    } catch (error) {
        console.error('Failed to start sync service:', error);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down sync service...');
    await syncService.stop();
    process.exit(0);
});

module.exports = { TransactionSyncService, startSyncService };