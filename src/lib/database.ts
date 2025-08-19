import type { ApiKey, Project, Chat, Message, AIProvider } from "./types";

// localStorage-based storage with JSON serialization
class Database {
  private readonly STORAGE_KEYS = {
    API_KEYS: "db_api_keys",
    PROJECTS: "db_projects",
    CHATS: "db_chats",
    MESSAGES: "db_messages",
  };

  // Helper methods for localStorage operations
  private getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return [];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage key ${key}:`, error);
    }
  }

  // Helper to parse dates from stored objects
  private parseDates<T>(obj: T): T {
    const parsed = { ...obj } as T & {
      createdAt?: Date | string;
      updatedAt?: Date | string;
    };
    if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
    if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);
    return parsed as T;
  }

  // API Keys
  async getApiKeys(): Promise<ApiKey[]> {
    return this.getFromStorage<ApiKey>(this.STORAGE_KEYS.API_KEYS).map((key) =>
      this.parseDates(key)
    );
  }

  async getApiKey(provider: AIProvider): Promise<ApiKey | null> {
    const apiKeys = await this.getApiKeys();
    return apiKeys.find((key) => key.provider === provider) || null;
  }

  async setApiKey(provider: AIProvider, key: string): Promise<void> {
    const apiKeys = await this.getApiKeys();
    const existingIndex = apiKeys.findIndex((k) => k.provider === provider);

    const apiKey: ApiKey = {
      id: crypto.randomUUID(),
      provider,
      key,
      createdAt: new Date(),
    };

    if (existingIndex >= 0) {
      apiKeys[existingIndex] = apiKey;
    } else {
      apiKeys.push(apiKey);
    }

    this.saveToStorage(this.STORAGE_KEYS.API_KEYS, apiKeys);
  }

  async deleteApiKey(provider: AIProvider): Promise<void> {
    const apiKeys = await this.getApiKeys();
    const filtered = apiKeys.filter((key) => key.provider !== provider);
    this.saveToStorage(this.STORAGE_KEYS.API_KEYS, filtered);
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const projects = this.getFromStorage<Project>(
      this.STORAGE_KEYS.PROJECTS
    ).map((project) => this.parseDates(project));
    return projects.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async getProject(id: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return projects.find((p) => p.id === id) || null;
  }

  async createProject(name: string, systemContext: string): Promise<Project> {
    const projects = await this.getProjects();
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      systemContext,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    projects.push(project);
    this.saveToStorage(this.STORAGE_KEYS.PROJECTS, projects);
    return project;
  }

  async updateProject(
    id: string,
    updates: Partial<Pick<Project, "name" | "systemContext">>
  ): Promise<void> {
    const projects = await this.getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index >= 0) {
      projects[index] = {
        ...projects[index],
        ...updates,
        updatedAt: new Date(),
      };
      this.saveToStorage(this.STORAGE_KEYS.PROJECTS, projects);
    }
  }

  async deleteProject(id: string): Promise<void> {
    const projects = await this.getProjects();
    const filtered = projects.filter((p) => p.id !== id);
    this.saveToStorage(this.STORAGE_KEYS.PROJECTS, filtered);

    // Also delete associated chats
    const chats = await this.getChats();
    const projectChats = chats.filter((c) => c.projectId === id);
    for (const chat of projectChats) {
      await this.deleteChat(chat.id);
    }
  }

  // Chats
  async getChats(): Promise<Chat[]> {
    const chats = this.getFromStorage<Chat>(this.STORAGE_KEYS.CHATS).map(
      (chat) => this.parseDates(chat)
    );
    return chats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getChat(id: string): Promise<Chat | null> {
    const chats = await this.getChats();
    return chats.find((c) => c.id === id) || null;
  }

  async createChat(title: string, projectId?: string): Promise<Chat> {
    const chats = await this.getChats();
    const chat: Chat = {
      id: crypto.randomUUID(),
      title,
      projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    chats.push(chat);
    this.saveToStorage(this.STORAGE_KEYS.CHATS, chats);
    return chat;
  }

  async updateChat(
    id: string,
    updates: Partial<Pick<Chat, "title">>
  ): Promise<void> {
    const chats = await this.getChats();
    const index = chats.findIndex((c) => c.id === id);
    if (index >= 0) {
      chats[index] = {
        ...chats[index],
        ...updates,
        updatedAt: new Date(),
      };
      this.saveToStorage(this.STORAGE_KEYS.CHATS, chats);
    }
  }

  async deleteChat(id: string): Promise<void> {
    const chats = await this.getChats();
    const filtered = chats.filter((c) => c.id !== id);
    this.saveToStorage(this.STORAGE_KEYS.CHATS, filtered);

    // Also delete associated messages
    const messages = await this.getMessages(id);
    if (messages.length > 0) {
      const allMessages = this.getFromStorage<Message>(
        this.STORAGE_KEYS.MESSAGES
      );
      const filteredMessages = allMessages.filter((m) => m.chatId !== id);
      this.saveToStorage(this.STORAGE_KEYS.MESSAGES, filteredMessages);
    }
  }

  // Messages
  async getMessages(chatId: string): Promise<Message[]> {
    const messages = this.getFromStorage<Message>(this.STORAGE_KEYS.MESSAGES)
      .map((message) => this.parseDates(message))
      .filter((m) => m.chatId === chatId);

    return messages.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async addMessage(
    chatId: string,
    content: string,
    role: "user" | "assistant",
    provider?: AIProvider
  ): Promise<Message> {
    const messages = this.getFromStorage<Message>(this.STORAGE_KEYS.MESSAGES);
    const message: Message = {
      id: crypto.randomUUID(),
      chatId,
      content,
      role,
      provider,
      createdAt: new Date(),
    };
    messages.push(message);
    this.saveToStorage(this.STORAGE_KEYS.MESSAGES, messages);

    // Update chat's updatedAt
    const chats = await this.getChats();
    const chatIndex = chats.findIndex((c) => c.id === chatId);
    if (chatIndex >= 0) {
      chats[chatIndex].updatedAt = new Date();
      this.saveToStorage(this.STORAGE_KEYS.CHATS, chats);
    }

    return message;
  }

  // Utility methods for data management
  async clearAllData(): Promise<void> {
    Object.values(this.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  async exportData(): Promise<string> {
    const data = {
      apiKeys: await this.getApiKeys(),
      projects: await this.getProjects(),
      chats: await this.getChats(),
      messages: this.getFromStorage<Message>(this.STORAGE_KEYS.MESSAGES),
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      if (data.apiKeys)
        this.saveToStorage(this.STORAGE_KEYS.API_KEYS, data.apiKeys);
      if (data.projects)
        this.saveToStorage(this.STORAGE_KEYS.PROJECTS, data.projects);
      if (data.chats) this.saveToStorage(this.STORAGE_KEYS.CHATS, data.chats);
      if (data.messages)
        this.saveToStorage(this.STORAGE_KEYS.MESSAGES, data.messages);
    } catch (error) {
      console.error("Error importing data:", error);
      throw new Error("Invalid JSON data format");
    }
  }
}

export const db = new Database();
