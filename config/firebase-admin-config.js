import admin from 'firebase-admin';
import serviceAccount from '../keys/liber-login-firebase-adminsdk-lp3t2-cd1ab2d587.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export default admin;