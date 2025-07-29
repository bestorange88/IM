import { IStorage, User, InsertUser } from './storage';

class EmergencyMemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private userIdCounter = 1;

  constructor() {
    // 添加系统用户
    this.users.set('system_yingkedaoren', {
      id: 'system_yingkedaoren',
      username: 'yingkedaoren',
      password: '$2b$10$HashForSystemUser1',
      nickname: '迎客道人',
      email: 'yingke@taishangong.com',
      avatar: null,
      status: 'online',
      isOnline: true,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    this.users.set('system_taishanzhenren', {
      id: 'system_taishanzhenren',
      username: 'taishanzhenren', 
      password: '$2b$10$HashForSystemUser2',
      nickname: '泰山真人',
      email: 'taishan@taishangong.com',
      avatar: null,
      status: 'online',
      isOnline: true,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      id,
      username: userData.username,
      password: userData.password,
      nickname: userData.nickname || userData.username,
      email: userData.email,
      avatar: userData.avatar,
      status: 'offline',
      isOnline: userData.isOnline || false,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).map(user => ({
      ...user,
      password: undefined
    })) as User[];
  }

  async updateUserStatus(userId: string, status: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.status = status;
      user.isOnline = status === 'online';
      user.lastSeen = new Date();
      user.updatedAt = new Date();
    }
  }

  async getSystemUsers(): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.id.startsWith('system_'))
      .map(user => ({ ...user, password: undefined })) as User[];
  }

  // 空实现其他必需方法
  async getFriends(userId: string): Promise<User[]> { return []; }
  async addFriend(userId: string, friendId: string): Promise<void> {}
  async getChatRooms(): Promise<any[]> { return []; }
  async createChatRoom(room: any): Promise<any> { return null; }
  async addRoomMember(member: any): Promise<any> { return null; }
  async getRoomMessages(roomId: number): Promise<any[]> { return []; }
  async createMessage(msg: any): Promise<any> { return null; }
  async getMessageWithUser(messageId: number): Promise<any> { return null; }
}

export const emergencyStorage = new EmergencyMemoryStorage();
