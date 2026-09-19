import crypto from 'crypto';

export const generateCsrfToken = ():string=>{
      return crypto.randomBytes(64).toString("hex");
    
}

