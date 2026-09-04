import bcrypt from 'bcrypt'

const Hash_salt = 12 

export const hashPassword = async (Password:string): Promise<string>=>{
    return bcrypt.hash(Password,Hash_salt)
}

export const comparePassword = async (Password:string,PasswordHash:string):Promise<boolean> =>{
    return bcrypt.compare(Password,PasswordHash)
}

