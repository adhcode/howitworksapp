import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './src/database/schema/users';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const client = postgres(process.env.DATABASE_URL!, {
    ssl: { rejectUnauthorized: false }
});
const db = drizzle(client);

(async () => {
    try {
        const result = await db
            .update(users)
            .set({ isEmailVerified: true })
            .where(eq(users.email, 'admin@howitworks.com.ng'))
            .returning();

        if (result.length > 0) {
            console.log('✅ User verified successfully:', {
                email: result[0].email,
                firstName: result[0].firstName,
                lastName: result[0].lastName,
                role: result[0].role,
                isEmailVerified: result[0].isEmailVerified
            });
        } else {
            console.log('❌ User not found');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
