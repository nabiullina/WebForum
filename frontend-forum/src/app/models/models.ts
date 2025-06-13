export interface User {
    id: string;
    nickname: string;
    bio?: string;
    userId: string;
    avatarUrl?: string;
    email?: string;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    createdAt: Date;
    categoryId?: number;
    updatedAt?: Date;
    likes?: number;
    comments?: number;
    author?: User;
    currentUserLiked?: boolean;
    mediaUrls?: string[];
}

export interface Comment {
    id?: number;
    text: string;
    postId: number;
    createdAt: Date;
    user: User;
    isOwner: boolean;
}

export interface Like {
    id: number;
    userId: string;
    postId: number;
    date: Date;
    user?: User;
}
