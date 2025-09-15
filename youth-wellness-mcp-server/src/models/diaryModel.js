import { dbDiary } from '../services/firebaseDiary.js';
import { collection, addDoc, doc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

class DiaryModel {
  constructor() {
    // Use dedicated diary database
    this.db = dbDiary;
    this.collectionName = 'diaryEntries';
    this.insightsCollectionName = 'diaryInsights';
  }

  // Create a new diary entry
  async createEntry(userId, entryData) {
    try {
      const entry = {
        userId,
        content: entryData.content,
        mood: entryData.mood || null,
        tags: entryData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        processed: false, // Flag for AI processing
        metadata: {
          wordCount: entryData.content.split(' ').length,
          characterCount: entryData.content.length
        }
      };

      const docRef = await addDoc(collection(this.db, this.collectionName), entry);
      return { id: docRef.id, ...entry };
    } catch (error) {
      throw new Error(`Failed to create diary entry: ${error.message}`);
    }
  }

  // Get diary entries for a user
  async getUserEntries(userId, options = {}) {
    try {
      let q = query(
        collection(this.db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      // Apply filters
      if (options.startDate) {
        q = query(q, where('createdAt', '>=', options.startDate));
      }
      if (options.endDate) {
        q = query(q, where('createdAt', '<=', options.endDate));
      }
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to get diary entries: ${error.message}`);
    }
  }

  // Get single entry by ID
  async getEntryById(entryId, userId) {
    try {
      const docRef = doc(this.db, this.collectionName, entryId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Entry not found');
      }

      const entry = docSnap.data();
      if (entry.userId !== userId) {
        throw new Error('Unauthorized access');
      }

      return { id: docSnap.id, ...entry };
    } catch (error) {
      throw new Error(`Failed to get diary entry: ${error.message}`);
    }
  }

  // Update diary entry
  async updateEntry(entryId, userId, updateData) {
    try {
      const entry = await this.getEntryById(entryId, userId);
      
      const updates = {
        ...updateData,
        updatedAt: new Date(),
        processed: false // Reset processing flag if content changed
      };

      if (updateData.content) {
        updates.metadata = {
          wordCount: updateData.content.split(' ').length,
          characterCount: updateData.content.length
        };
      }

      await updateDoc(doc(this.db, this.collectionName, entryId), updates);
      return { id: entryId, ...entry, ...updates };
    } catch (error) {
      throw new Error(`Failed to update diary entry: ${error.message}`);
    }
  }

  // Delete diary entry
  async deleteEntry(entryId, userId) {
    try {
      const entry = await this.getEntryById(entryId, userId);
      await deleteDoc(doc(this.db, this.collectionName, entryId));
      
      // Also delete associated insights
      await this.deleteEntryInsights(entryId);
      
      return { message: 'Entry deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete diary entry: ${error.message}`);
    }
  }

  // Store AI-generated insights
  async storeInsights(entryId, insights) {
    try {
      const insightData = {
        entryId,
        sentiment: insights.sentiment,
        emotions: insights.emotions,
        entities: insights.entities,
        themes: insights.themes,
        triggers: insights.triggers || [],
        copingStrategies: insights.copingStrategies || [],
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(this.db, this.insightsCollectionName), insightData);
      
      // Mark entry as processed
      await updateDoc(doc(this.db, this.collectionName, entryId), {
        processed: true,
        processedAt: new Date()
      });

      return { id: docRef.id, ...insightData };
    } catch (error) {
      throw new Error(`Failed to store insights: ${error.message}`);
    }
  }

  // Get insights for an entry
  async getEntryInsights(entryId) {
    try {
      const q = query(
        collection(this.db, this.insightsCollectionName),
        where('entryId', '==', entryId)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to get insights: ${error.message}`);
    }
  }

  // Delete insights for an entry
  async deleteEntryInsights(entryId) {
    try {
      const q = query(
        collection(this.db, this.insightsCollectionName),
        where('entryId', '==', entryId)
      );
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(this.db);
      snapshot.docs.forEach(docSnapshot => {
        batch.delete(docSnapshot.ref);
      });
      
      await batch.commit();
    } catch (error) {
      throw new Error(`Failed to delete insights: ${error.message}`);
    }
  }

  // Get unprocessed entries for AI analysis
  async getUnprocessedEntries(limit = 10) {
    try {
      const q = query(
        collection(this.db, this.collectionName),
        where('processed', '==', false),
        limit(limit)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to get unprocessed entries: ${error.message}`);
    }
  }

  // Get user's writing statistics
  async getUserStats(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const entries = await this.getUserEntries(userId, {
        startDate: startDate
      });

      const stats = {
        totalEntries: entries.length,
        totalWords: entries.reduce((sum, entry) => sum + (entry.metadata?.wordCount || 0), 0),
        averageWordsPerEntry: 0,
        writingStreak: 0,
        daysActive: new Set(entries.map(entry => {
          const date = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
          return date.toDateString();
        })).size
      };

      stats.averageWordsPerEntry = stats.totalEntries > 0 
        ? Math.round(stats.totalWords / stats.totalEntries) 
        : 0;

      // Calculate writing streak
      stats.writingStreak = this.calculateWritingStreak(entries);

      return stats;
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
  }

  // Helper method to calculate writing streak
  calculateWritingStreak(entries) {
    if (entries.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const entryDates = entries
      .map(entry => {
        const date = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .sort((a, b) => b - a); // Most recent first

    const uniqueDates = [...new Set(entryDates)];
    let streak = 0;
    let currentDate = today.getTime();

    for (const entryDate of uniqueDates) {
      if (entryDate === currentDate) {
        streak++;
        currentDate -= 24 * 60 * 60 * 1000; // Go back one day
      } else if (entryDate === currentDate + 24 * 60 * 60 * 1000) {
        // Entry is from yesterday, continue streak
        streak++;
        currentDate = entryDate - 24 * 60 * 60 * 1000;
      } else {
        break; // Streak broken
      }
    }

    return streak;
  }
}

export default new DiaryModel();