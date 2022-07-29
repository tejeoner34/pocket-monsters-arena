export interface User {
    defeats: number;
    points: number;
    wins: number;
    userName: string;
    position?: number;
}

export interface TopUsers {
    topUsers: User[];
    user: User;
}