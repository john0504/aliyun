export interface Account {
    account?: string;
    token?: string;
    isOAuth?: boolean;
    authProvider?: string;
    isLoggedIn: boolean;
    isNewUser?: boolean;
    pTokenBundle?: any;
}