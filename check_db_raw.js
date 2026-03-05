const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || "postgresql://wabotti:wabotti@127.0.0.1:5433/wabotti?sslmode=disable",
    });

    try {
        await client.connect();

        console.log("--- ENUMS ---");
        const enums = await client.query(`
            SELECT t.typname as enum_name, e.enumlabel as enum_value
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid
            ORDER BY t.typname, e.enumsortorder;
        `);
        console.table(enums.rows);

        console.log("--- COMPANIES COLUMNS ---");
        const resComp = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'companies'
            ORDER BY column_name;
        `);
        console.table(resComp.rows);

        console.log("--- SERVICES COLUMNS ---");
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'services'
            ORDER BY column_name;
        `);
        console.table(res.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
