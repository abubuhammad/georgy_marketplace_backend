export interface CreateChatRoomData {
    type: 'direct' | 'group' | 'support';
    participants: string[];
    name?: string;
}
export interface SendMessageData {
    chatId: string;
    senderId: string;
    content: string;
    type?: 'text' | 'image' | 'file' | 'location';
    metadata?: any;
}
export declare class ChatService {
    createChatRoom(data: CreateChatRoomData): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        serviceRequestId: string | null;
        customerId: string;
        artisanId: string;
        lastMessageAt: Date | null;
    }>;
    findDirectChatRoom(participants: string[]): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        serviceRequestId: string | null;
        customerId: string;
        artisanId: string;
        lastMessageAt: Date | null;
    } | null>;
    sendMessage(data: SendMessageData): Promise<{
        id: string;
        createdAt: Date;
        content: string;
        messageType: string;
        fileUrl: string | null;
        readAt: Date | null;
        sentAt: Date;
        chatId: string;
        senderId: string;
        recipientId: string;
    }>;
    markMessagesAsRead(chatId: string, userId: string, messageIds?: string[]): Promise<{
        success: boolean;
        updatedCount: number;
    }>;
    getChatRooms(userId: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        rooms: {
            unreadCount: number;
            messages: ({
                sender: {
                    id: string;
                    email: string;
                    role: string;
                    password: string;
                    firstName: string;
                    lastName: string;
                    phone: string | null;
                    avatar: string | null;
                    emailVerified: boolean;
                    phoneVerified: boolean;
                    identityVerified: boolean;
                    addressVerified: boolean;
                    isActive: boolean;
                    isSuspended: boolean;
                    suspendedAt: Date | null;
                    isBanned: boolean;
                    bannedAt: Date | null;
                    isFrozen: boolean;
                    frozenAt: Date | null;
                    isDeleted: boolean;
                    deletedAt: Date | null;
                    verifiedDate: Date | null;
                    lastLoginAt: Date | null;
                    specializations: string | null;
                    activeDisputes: number;
                    storeCredit: import("@prisma/client/runtime/library").Decimal;
                    moderationStats: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                createdAt: Date;
                content: string;
                messageType: string;
                fileUrl: string | null;
                readAt: Date | null;
                sentAt: Date;
                chatId: string;
                senderId: string;
                recipientId: string;
            })[];
            id: string;
            createdAt: Date;
            status: string;
            serviceRequestId: string | null;
            customerId: string;
            artisanId: string;
            lastMessageAt: Date | null;
        }[];
        total: number;
        hasMore: boolean;
    }>;
    getChatMessages(chatId: string, userId: string, options?: {
        limit?: number;
        offset?: number;
        before?: string;
    }): Promise<{
        messages: ({
            sender: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            content: string;
            messageType: string;
            fileUrl: string | null;
            readAt: Date | null;
            sentAt: Date;
            chatId: string;
            senderId: string;
            recipientId: string;
        })[];
        total: number;
        hasMore: boolean;
    }>;
    getUnreadCount(chatId: string, userId: string): Promise<number>;
    deleteMessage(messageId: string, userId: string): Promise<{
        success: boolean;
    }>;
    searchMessages(query: string, userId: string, chatId?: string): Promise<{
        messages: ({
            chat: {
                id: string;
            };
            sender: {
                id: string;
                firstName: string;
                lastName: string;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            content: string;
            messageType: string;
            fileUrl: string | null;
            readAt: Date | null;
            sentAt: Date;
            chatId: string;
            senderId: string;
            recipientId: string;
        })[];
    }>;
    getChatRoomInfo(chatId: string, userId: string): Promise<{
        id: string;
        type: string;
        participantDetails: {
            id: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
        }[];
        unreadCount: number;
        messageCount: number;
    }>;
    private generateId;
    getChatStats(dateRange?: {
        start: Date;
        end: Date;
    }): Promise<{
        totalMessages: number;
        totalRooms: number;
        activeUsers: number;
    }>;
}
declare const chatService: ChatService;
export { chatService };
//# sourceMappingURL=chatService.d.ts.map