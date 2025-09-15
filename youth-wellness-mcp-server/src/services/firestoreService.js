import  Firestore from '@google-cloud/firestore'
import dotenv from "dotenv";
dotenv.config();
class FirestoreService {
  constructor() {
  this.db = new Firestore({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    databaseId: process.env.FIRESTORE_DATABASE_ID
  });

}

  // User operations
  async createUser(userId, userData) {
    try {
      await this.db.collection('users').doc(userId).set({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, userId };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const userDoc = await this.db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return null;
      }
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  // Chat operations
async saveChatMessage(chatId, message) {
  try {
    await this.db.collection('chats').doc(chatId).collection('messages').add({
      ...message,
      timestamp: new Date()
    });

    await this.db.collection('chats').doc(chatId).set({
      lastMessage: message.content,
      lastMessageAt: new Date(),
      messageCount: Firestore.FieldValue.increment(1)
    }, { merge: true });

    

    return { success: true };
  } catch (error) {
    console.error("Firestore error:", error.code, error.message, {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      databaseId: process.env.FIRESTORE_DATABASE_ID,
      chatId
    });
    throw error; // rethrow so your controller still sees the error
  }
}


  async getChatHistory(chatId, limit = 50) {
    try {
      const messagesRef = this.db
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .limit(limit);
      
      const snapshot = await messagesRef.get();
      const messages = [];
      
      snapshot.forEach(doc => {
        messages.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  // Resource operations
  async getWellnessResources(category = null, limit = 10) {
    try {
      let query = this.db.collection('resources');
      
      if (category) {
        query = query.where('category', '==', category);
      }
      
      query = query.limit(limit);
      
      const snapshot = await query.get();
      const resources = [];
      
      snapshot.forEach(doc => {
        resources.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return resources;
    } catch (error) {
      console.error('Error getting wellness resources:', error);
      throw error;
    }
  }

  async addWellnessResource(resource) {
    try {
      const docRef = await this.db.collection('resources').add({
        ...resource,
        createdAt: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding wellness resource:', error);
      throw error;
    }
  }
}

const firestoreService = new FirestoreService();
export default firestoreService;
