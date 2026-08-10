import process from 'node:process';
import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

dotenv.config({ path: '.env.local' });
dotenv.config();

function readServiceAccount() {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT não foi definido.');
    const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    const account = JSON.parse(json);
    if (account.private_key) account.private_key = account.private_key.replace(/\\n/g, '\n');
    return account;
}

const args = process.argv.slice(2);
const target = args.find((arg) => !arg.startsWith('--'));
const revoke = args.includes('--revoke');

if (!target || args.includes('--help')) {
    console.log('Uso: npm run admin:set -- <uid-ou-email> [--revoke]');
    console.log('Requer FIREBASE_SERVICE_ACCOUNT com o JSON (literal ou base64).');
    process.exit(target ? 0 : 1);
}

try {
    const app = getApps()[0] || initializeApp({ credential: cert(readServiceAccount()) });
    const auth = getAuth(app);
    const user = target.includes('@') ? await auth.getUserByEmail(target) : await auth.getUser(target);
    const claims = { ...(user.customClaims || {}) };
    if (revoke) delete claims.admin;
    else claims.admin = true;
    await auth.setCustomUserClaims(user.uid, claims);
    console.log(`${revoke ? 'Acesso admin revogado de' : 'Acesso admin concedido a'} ${user.email || user.uid}.`);
    console.log('A alteração entra em vigor quando o token do usuário for renovado.');
} catch (error) {
    console.error(`Erro: ${error.message}`);
    process.exit(1);
}
