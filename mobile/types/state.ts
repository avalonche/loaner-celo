export interface Wallet {
    address: string,
    phoneNumber: string,
    balance: string,
}

export interface User {
    wallet: Wallet,
    role: Role,
}

export interface Role {
    isBorrower: boolean,
    isManager: boolean,
}