import { drizzle } from 'drizzle-orm/node-postgres';

export async function GET() {

    if (process.env.DATABASE_URL) {
        const db = drizzle(process.env.DATABASE_URL);
        const result = await db.execute('select 1');
        console.log(result);
        return Response.json({ message: result })
    }

    return Response.json({ message: process.env.DATABASE_URL })
}
