export interface User {
    defeats: number;
    points: number;
    wins: number;
    userName: string;
    _id: string;
    position?: number;
}

export interface TopUsers {
    topUsers: User[];
    user: User;
}