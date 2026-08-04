import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  updateDoc, 
  deleteDoc,
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  arrayUnion
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { UserProfile, AffiliateOffer, JobRecommendation, AIReadinessReport, BusinessIdea, DailySuccessProgress, AIMemory } from '../types';


const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);
export const db = (firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)') 
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId) 
  : getFirestore(app);

// Validate connection to Firestore on initialization
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testFirestoreConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Local Storage Fallback Key for offline or demo state
const LOCAL_USER_KEY = 'rynexo_user_profile_v1';
const LOCAL_AFFILIATES_KEY = 'rynexo_custom_affiliates_v1';

// Register User in Firebase Auth and Firestore
export async function registerUserInFirebase(
  data: {
    fullName: string;
    email: string;
    password: string;
    country: string;
    city: string;
    phone?: string;
  }
): Promise<UserProfile> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const firebaseUser = userCredential.user;
    const now = new Date().toISOString();

    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      fullName: data.fullName,
      email: data.email,
      country: data.country,
      city: data.city,
      phone: data.phone || '',
      createdAt: now,
      lastLogin: now,
      language: 'en',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.fullName)}`,
      plan: 'Free',
      currentStreak: 0,
      incomeTarget: 0,
      currentIncome: 0,
      experience: '',
      skills: [],
      careerGoals: [],
      businessInterests: [],
      budget: 0,
      completedMissions: 0,
      savedJobs: 0,
      savedBusinesses: 0,

      // Compatibility & Tracking
      monthlyGoalUSD: 0,
      availableBudgetUSD: 0,
      weeklyHours: 0,
      experienceLevel: 'beginner',
      subscriptionTier: 'free',
      jobsViewed: [],
      jobsApplied: [],
      businessesCreated: [],
      affiliatesJoined: [],
      streakHistory: [],
      achievements: [],
      readinessScore: 50,
      currentMonthlyIncomeUSD: 0,
    };

    // Save to Firestore collection 'users' with Document ID = Firebase Auth UID
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userRef, newProfile);
      // Requirement: Auto-sync AI Memory document on registration
      syncAIMemoryToFirestore(newProfile).catch(e => console.warn('AI memory auto-sync error:', e));
    } catch (fsErr) {
      console.warn('Firestore write warning:', fsErr);
    }

    // Backup to localStorage
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newProfile));
    return newProfile;
  } catch (error: any) {
    console.error('Registration Error:', error);
    throw error;
  }
}

// Sign In User
export async function signInUserInFirebase(email: string, password: string): Promise<UserProfile> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    const now = new Date().toISOString();

    const userRef = doc(db, 'users', firebaseUser.uid);
    let profile: UserProfile;

    // Fetch profile from Firestore or auto-create if missing
    try {
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const existingData = snapshot.data() as UserProfile;
        // Requirement 2: If document already exists, update only lastLogin
        await updateDoc(userRef, { lastLogin: now });
        profile = { ...existingData, lastLogin: now };
      } else {
        // Requirement 5: If profile does not exist, create it automatically
        profile = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || email.split('@')[0],
          email: email,
          country: '',
          city: '',
          phone: '',
          createdAt: now,
          lastLogin: now,
          language: 'en',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
          plan: 'Free',
          currentStreak: 0,
          incomeTarget: 0,
          currentIncome: 0,
          experience: '',
          skills: [],
          careerGoals: [],
          businessInterests: [],
          budget: 0,
          completedMissions: 0,
          savedJobs: 0,
          savedBusinesses: 0,
          monthlyGoalUSD: 0,
          availableBudgetUSD: 0,
          weeklyHours: 0,
          experienceLevel: 'beginner',
          subscriptionTier: 'free',
          jobsViewed: [],
          jobsApplied: [],
          businessesCreated: [],
          affiliatesJoined: [],
          streakHistory: [],
          achievements: [],
          readinessScore: 50,
          currentMonthlyIncomeUSD: 0,
        };
        await setDoc(userRef, profile);
      }
      // Auto sync AI memory on signin
      syncAIMemoryToFirestore(profile).catch(e => console.warn('AI memory auto-sync error:', e));
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
      return profile;
    } catch (fsErr) {
      console.warn('Firestore read/write error on signin:', fsErr);
    }

    // Fallback profile construction if Firestore offline
    const cached = localStorage.getItem(LOCAL_USER_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    const fallbackProfile: UserProfile = {
      uid: firebaseUser.uid,
      fullName: firebaseUser.displayName || email.split('@')[0],
      email: email,
      country: '',
      city: '',
      phone: '',
      createdAt: now,
      lastLogin: now,
      language: 'en',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
      plan: 'Free',
      currentStreak: 0,
      incomeTarget: 0,
      currentIncome: 0,
      experience: '',
      skills: [],
      careerGoals: [],
      businessInterests: [],
      budget: 0,
      completedMissions: 0,
      savedJobs: 0,
      savedBusinesses: 0,
      monthlyGoalUSD: 0,
      availableBudgetUSD: 0,
      weeklyHours: 0,
      experienceLevel: 'beginner',
      subscriptionTier: 'free',
    };

    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fallbackProfile));
    return fallbackProfile;
  } catch (error: any) {
    console.error('Sign In Error:', error);
    throw error;
  }
}

// Sign Out
export async function logoutUserFromFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('Signout warning:', err);
  }
  localStorage.removeItem(LOCAL_USER_KEY);
}

// Update User Profile in Firestore
export async function updateUserProfileInFirestore(updatedData: Partial<UserProfile>, uid: string): Promise<UserProfile> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updatedData);
  } catch (err) {
    console.warn('Firestore profile update warning:', err);
  }

  // Sync to local cache
  const cached = localStorage.getItem(LOCAL_USER_KEY);
  let current: UserProfile = cached ? JSON.parse(cached) : ({} as UserProfile);
  const updated = { ...current, ...updatedData };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));

  // Requirement: Whenever user changes profile information, update AI Memory automatically
  if (uid) {
    syncAIMemoryToFirestore(updated).catch(e => console.warn('AI memory update sync error:', e));
  }

  return updated;
}

// Real-time Firestore Activity Tracking Helpers
export async function recordJobViewInFirestore(jobTitle: string, userId: string): Promise<void> {
  if (!userId || userId === 'guest') return;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      jobsViewed: arrayUnion(jobTitle),
    });
  } catch (err) {
    console.warn('Firestore record job view error:', err);
  }
}

export async function recordJobApplyInFirestore(jobTitle: string, userId: string): Promise<void> {
  if (!userId || userId === 'guest') return;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      jobsApplied: arrayUnion(jobTitle),
    });
  } catch (err) {
    console.warn('Firestore record job apply error:', err);
  }
}

export async function recordBusinessCreatedInFirestore(businessName: string, userId: string): Promise<void> {
  if (!userId || userId === 'guest') return;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      businessesCreated: arrayUnion(businessName),
    });
  } catch (err) {
    console.warn('Firestore record business created error:', err);
  }
}

export async function recordAffiliateJoinedInFirestore(affiliateName: string, userId: string): Promise<void> {
  if (!userId || userId === 'guest') return;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      affiliatesJoined: arrayUnion(affiliateName),
    });
  } catch (err) {
    console.warn('Firestore record affiliate joined error:', err);
  }
}

export async function recordMissionCompletedInFirestore(missionId: string, userId: string): Promise<void> {
  if (!userId || userId === 'guest') return;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      completedMissions: arrayUnion(missionId),
    });
  } catch (err) {
    console.warn('Firestore record mission completed error:', err);
  }
}

// Add Custom Affiliate Link (Admin)
export async function addCustomAffiliateToFirestore(offer: Omit<AffiliateOffer, 'id'>): Promise<AffiliateOffer> {
  const newOffer: AffiliateOffer = {
    ...offer,
    id: 'aff_' + Date.now(),
    isCustomAdmin: true,
    addedAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, 'affiliates'), newOffer);
    newOffer.id = docRef.id;
  } catch (err) {
    console.warn('Firestore affiliate add warning, saving to local cache:', err);
  }

  // Save to local cache
  const existingLocalStr = localStorage.getItem(LOCAL_AFFILIATES_KEY);
  const existingLocal: AffiliateOffer[] = existingLocalStr ? JSON.parse(existingLocalStr) : [];
  localStorage.setItem(LOCAL_AFFILIATES_KEY, JSON.stringify([newOffer, ...existingLocal]));

  return newOffer;
}

// Get Custom Affiliate Offers
export async function fetchCustomAffiliatesFromFirestore(): Promise<AffiliateOffer[]> {
  try {
    const q = query(collection(db, 'affiliates'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const results: AffiliateOffer[] = [];
      snapshot.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() } as AffiliateOffer);
      });
      return results;
    }
  } catch (err) {
    console.warn('Firestore affiliate fetch fallback to local:', err);
  }

  const existingLocalStr = localStorage.getItem(LOCAL_AFFILIATES_KEY);
  return existingLocalStr ? JSON.parse(existingLocalStr) : [];
}

// Helper to get active user cached session
export function getStoredUserSession(): UserProfile | null {
  const cached = localStorage.getItem(LOCAL_USER_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }
  return null;
}

// Fetch user profile from Firestore by UID
export async function fetchUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      const profile = snapshot.data() as UserProfile;
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
      return profile;
    }
  } catch (err) {
    console.warn('Firestore user fetch error:', err);
  }
  return getStoredUserSession();
}

// Local Storage Fallback Key for Saved Jobs
const LOCAL_SAVED_JOBS_KEY = 'rynexo_saved_jobs_v1';

// Save Job to Firestore
export async function saveJobToFirestore(job: JobRecommendation, userId: string): Promise<void> {
  const docId = `${userId}_${job.id}`;
  const payload = {
    id: docId,
    userId,
    jobId: job.id,
    job,
    savedAt: new Date().toISOString(),
  };

  try {
    const jobRef = doc(db, 'saved_jobs', docId);
    await setDoc(jobRef, payload);
  } catch (err) {
    console.warn('Firestore save job warning, storing in local cache:', err);
  }

  // Backup to local storage
  try {
    const cachedStr = localStorage.getItem(LOCAL_SAVED_JOBS_KEY);
    const existing: JobRecommendation[] = cachedStr ? JSON.parse(cachedStr) : [];
    if (!existing.some((j) => j.id === job.id)) {
      localStorage.setItem(LOCAL_SAVED_JOBS_KEY, JSON.stringify([job, ...existing]));
    }
  } catch (localErr) {
    console.warn('Local storage write warning:', localErr);
  }
}

// Remove Saved Job from Firestore
export async function removeSavedJobFromFirestore(jobId: string, userId: string): Promise<void> {
  const docId = `${userId}_${jobId}`;
  try {
    const jobRef = doc(db, 'saved_jobs', docId);
    await deleteDoc(jobRef);
  } catch (err) {
    console.warn('Firestore remove job warning:', err);
  }

  // Update local storage
  try {
    const cachedStr = localStorage.getItem(LOCAL_SAVED_JOBS_KEY);
    if (cachedStr) {
      const existing: JobRecommendation[] = JSON.parse(cachedStr);
      const filtered = existing.filter((j) => j.id !== jobId);
      localStorage.setItem(LOCAL_SAVED_JOBS_KEY, JSON.stringify(filtered));
    }
  } catch (localErr) {
    console.warn('Local storage update warning:', localErr);
  }
}

// Fetch Saved Jobs from Firestore
export async function fetchSavedJobsFromFirestore(userId: string): Promise<JobRecommendation[]> {
  try {
    const q = query(collection(db, 'saved_jobs'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const savedJobs: JobRecommendation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.userId === userId && data.job) {
          savedJobs.push(data.job as JobRecommendation);
        }
      });
      if (savedJobs.length > 0) {
        localStorage.setItem(LOCAL_SAVED_JOBS_KEY, JSON.stringify(savedJobs));
        return savedJobs;
      }
    }
  } catch (err) {
    console.warn('Firestore fetch saved jobs warning, using cached:', err);
  }

  // Fallback to local storage
  try {
    const cachedStr = localStorage.getItem(LOCAL_SAVED_JOBS_KEY);
    return cachedStr ? JSON.parse(cachedStr) : [];
  } catch {
    return [];
  }
}

// Local Storage Fallback Key for AI Readiness Reports
const LOCAL_READINESS_KEY = 'rynexo_ai_readiness_reports_v1';

// Save AI Readiness Report to Firestore
export async function saveAIReadinessReportToFirestore(
  report: AIReadinessReport,
  userId?: string
): Promise<void> {
  const docId = report.id || `report_${Date.now()}`;
  const payload = {
    ...report,
    id: docId,
    userId: userId || report.userId || 'guest',
    savedAt: new Date().toISOString(),
  };

  try {
    const reportRef = doc(db, 'ai_readiness_reports', docId);
    await setDoc(reportRef, payload);
  } catch (err) {
    console.warn('Firestore save readiness report warning, storing in local cache:', err);
  }

  // Backup to local storage
  try {
    const cachedStr = localStorage.getItem(LOCAL_READINESS_KEY);
    const existing: AIReadinessReport[] = cachedStr ? JSON.parse(cachedStr) : [];
    const updatedList = [payload as AIReadinessReport, ...existing.filter((r) => r.id !== docId)];
    localStorage.setItem(LOCAL_READINESS_KEY, JSON.stringify(updatedList));
  } catch (localErr) {
    console.warn('Local storage write readiness warning:', localErr);
  }
}

// Fetch AI Readiness Reports History from Firestore
export async function fetchAIReadinessHistoryFromFirestore(
  userId?: string
): Promise<AIReadinessReport[]> {
  try {
    const q = query(collection(db, 'ai_readiness_reports'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const reports: AIReadinessReport[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!userId || data.userId === userId || data.userId === 'guest') {
          reports.push(data as AIReadinessReport);
        }
      });
      if (reports.length > 0) {
        reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localStorage.setItem(LOCAL_READINESS_KEY, JSON.stringify(reports));
        return reports;
      }
    }
  } catch (err) {
    console.warn('Firestore fetch readiness warning, using cached:', err);
  }

  // Fallback to local storage
  try {
    const cachedStr = localStorage.getItem(LOCAL_READINESS_KEY);
    if (cachedStr) {
      const reports: AIReadinessReport[] = JSON.parse(cachedStr);
      reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return reports;
    }
    return [];
  } catch {
    return [];
  }
}

// Local Storage Fallback Key for Saved Business Ideas
const LOCAL_SAVED_BUSINESSES_KEY = 'rynexo_saved_business_ideas_v1';

// Save Business Idea to Firestore
export async function saveBusinessIdeaToFirestore(
  idea: BusinessIdea,
  userId?: string
): Promise<void> {
  const docId = idea.id || `biz_${Date.now()}`;
  const payload = {
    ...idea,
    id: docId,
    userId: userId || idea.userId || 'guest',
    savedAt: new Date().toISOString(),
  };

  try {
    const bizRef = doc(db, 'saved_business_ideas', docId);
    await setDoc(bizRef, payload);
  } catch (err) {
    console.warn('Firestore save business idea warning, using local cache:', err);
  }

  // Backup to local storage
  try {
    const cachedStr = localStorage.getItem(LOCAL_SAVED_BUSINESSES_KEY);
    const existing: BusinessIdea[] = cachedStr ? JSON.parse(cachedStr) : [];
    const updated = [payload as BusinessIdea, ...existing.filter((b) => b.id !== docId)];
    localStorage.setItem(LOCAL_SAVED_BUSINESSES_KEY, JSON.stringify(updated));
  } catch (localErr) {
    console.warn('Local storage write business idea warning:', localErr);
  }
}

// Fetch Saved Business Ideas from Firestore
export async function fetchSavedBusinessIdeasFromFirestore(
  userId?: string
): Promise<BusinessIdea[]> {
  try {
    const q = query(collection(db, 'saved_business_ideas'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const list: BusinessIdea[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!userId || data.userId === userId || data.userId === 'guest') {
          list.push(data as BusinessIdea);
        }
      });
      if (list.length > 0) {
        localStorage.setItem(LOCAL_SAVED_BUSINESSES_KEY, JSON.stringify(list));
        return list;
      }
    }
  } catch (err) {
    console.warn('Firestore fetch saved business ideas warning, using cached:', err);
  }

  // Fallback to local storage
  try {
    const cachedStr = localStorage.getItem(LOCAL_SAVED_BUSINESSES_KEY);
    return cachedStr ? JSON.parse(cachedStr) : [];
  } catch {
    return [];
  }
}

// Remove Saved Business Idea from Firestore
export async function removeSavedBusinessIdeaFromFirestore(
  ideaId: string,
  userId?: string
): Promise<void> {
  try {
    const bizRef = doc(db, 'saved_business_ideas', ideaId);
    await deleteDoc(bizRef);
  } catch (err) {
    console.warn('Firestore delete business idea warning:', err);
  }

  try {
    const cachedStr = localStorage.getItem(LOCAL_SAVED_BUSINESSES_KEY);
    if (cachedStr) {
      const existing: BusinessIdea[] = JSON.parse(cachedStr);
      const updated = existing.filter((b) => b.id !== ideaId);
      localStorage.setItem(LOCAL_SAVED_BUSINESSES_KEY, JSON.stringify(updated));
    }
  } catch (localErr) {
    console.warn('Local storage delete business idea warning:', localErr);
  }
}

// Local Storage Key for Daily Success Progress
const LOCAL_DAILY_SUCCESS_KEY = 'rynexo_daily_success_progress_v1';
const LOCAL_AI_MEMORY_KEY = 'rynexo_ai_memory_v1';

// Sync & Update AI Memory in Firestore (collection: 'ai_memory', doc: UID)
export async function syncAIMemoryToFirestore(
  user: UserProfile,
  overrides?: Partial<AIMemory>
): Promise<AIMemory> {
  if (!user || !user.uid) {
    throw new Error('Valid UserProfile required to sync AI memory');
  }

  const uid = user.uid;
  const now = new Date().toISOString();

  // Fetch existing memory document if available
  let existing: Partial<AIMemory> = {};
  try {
    const memoryRef = doc(db, 'ai_memory', uid);
    const snap = await getDoc(memoryRef);
    if (snap.exists()) {
      existing = snap.data() as AIMemory;
    }
  } catch (err) {
    console.warn('Firestore fetch ai_memory warning:', err);
  }

  const memory: AIMemory = {
    uid: uid,
    fullName: user.fullName || existing.fullName || 'Candidate',
    country: user.country || existing.country || '',
    city: user.city || existing.city || '',
    languages: user.languages || (user.language ? [user.language] : []) || existing.languages || ['en'],
    skills: user.skills || existing.skills || [],
    experience: user.experience || user.experienceLevel || existing.experience || 'beginner',
    careerGoals: user.careerGoals || (user.careerGoal ? [user.careerGoal] : []) || existing.careerGoals || [],
    businessInterests: user.businessInterests || existing.businessInterests || [],
    budget: user.budget ?? user.availableBudgetUSD ?? existing.budget ?? 0,
    monthlyIncomeTarget: user.incomeTarget ?? user.monthlyGoalUSD ?? existing.monthlyIncomeTarget ?? 0,
    currentIncome: user.currentIncome ?? user.currentMonthlyIncomeUSD ?? existing.currentIncome ?? 0,
    preferredJobTypes: existing.preferredJobTypes || ['Remote', 'Full Time', 'AI Operations'],
    preferredBusinessTypes: existing.preferredBusinessTypes || ['AI Automation Agency', 'E-commerce', 'SaaS'],
    savedJobs: existing.savedJobs || [],
    savedBusinesses: existing.savedBusinesses || [],
    aiReadinessReports: user.aiReadinessReport ? [user.aiReadinessReport] : (existing.aiReadinessReports || []),
    dailyMissionHistory: existing.dailyMissionHistory || [],
    successStreak: user.currentStreak ?? existing.successStreak ?? 0,
    aiConversationsSummary: existing.aiConversationsSummary || '',
    lastAIRecommendation: existing.lastAIRecommendation || '',
    lastActiveTime: now,
    updatedAt: now,
    ...overrides,
  };

  try {
    const memoryRef = doc(db, 'ai_memory', uid);
    await setDoc(memoryRef, memory, { merge: true });
  } catch (err) {
    console.warn('Firestore write ai_memory warning:', err);
  }

  try {
    localStorage.setItem(`${LOCAL_AI_MEMORY_KEY}_${uid}`, JSON.stringify(memory));
  } catch (localErr) {
    console.warn('Local storage write ai_memory warning:', localErr);
  }

  return memory;
}

// Fetch AI Memory from Firestore (collection: 'ai_memory', doc: UID)
export async function fetchAIMemoryFromFirestore(uid: string): Promise<AIMemory | null> {
  if (!uid) return null;
  try {
    const memoryRef = doc(db, 'ai_memory', uid);
    const snap = await getDoc(memoryRef);
    if (snap.exists()) {
      const data = snap.data() as AIMemory;
      localStorage.setItem(`${LOCAL_AI_MEMORY_KEY}_${uid}`, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Firestore fetch ai_memory error:', err);
  }

  try {
    const cached = localStorage.getItem(`${LOCAL_AI_MEMORY_KEY}_${uid}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

// Helper to update AI Recommendation & Conversation Summary in AI Memory
export async function updateAIMemoryRecommendationInFirestore(
  uid: string,
  lastRecommendation: string,
  conversationsSummary?: string
): Promise<void> {
  if (!uid) return;
  const now = new Date().toISOString();
  const payload: Partial<AIMemory> = {
    lastAIRecommendation: lastRecommendation,
    lastActiveTime: now,
    updatedAt: now,
  };
  if (conversationsSummary) {
    payload.aiConversationsSummary = conversationsSummary;
  }

  try {
    const memoryRef = doc(db, 'ai_memory', uid);
    await setDoc(memoryRef, payload, { merge: true });
  } catch (err) {
    console.warn('Firestore update ai_memory recommendation warning:', err);
  }

  try {
    const cachedStr = localStorage.getItem(`${LOCAL_AI_MEMORY_KEY}_${uid}`);
    if (cachedStr) {
      const existing = JSON.parse(cachedStr);
      const updated = { ...existing, ...payload };
      localStorage.setItem(`${LOCAL_AI_MEMORY_KEY}_${uid}`, JSON.stringify(updated));
    }
  } catch (localErr) {
    console.warn('Local storage update ai_memory recommendation warning:', localErr);
  }
}

// Save Daily Success Progress to Firestore
export async function saveDailySuccessProgressToFirestore(
  progress: DailySuccessProgress
): Promise<void> {
  const docId = progress.userId || 'guest';
  const payload = {
    ...progress,
    updatedAt: new Date().toISOString(),
  };

  try {
    const progressRef = doc(db, 'user_daily_success', docId);
    await setDoc(progressRef, payload);
  } catch (err) {
    console.warn('Firestore save daily success progress warning, using local cache:', err);
  }

  // Backup to Local Storage
  try {
    localStorage.setItem(LOCAL_DAILY_SUCCESS_KEY, JSON.stringify(payload));
  } catch (localErr) {
    console.warn('Local storage save daily success warning:', localErr);
  }
}

// Fetch Daily Success Progress from Firestore
export async function fetchDailySuccessProgressFromFirestore(
  userId?: string
): Promise<DailySuccessProgress | null> {
  const targetId = userId || 'guest';
  try {
    const progressRef = doc(db, 'user_daily_success', targetId);
    const snapshot = await getDoc(progressRef);
    if (snapshot.exists()) {
      const data = snapshot.data() as DailySuccessProgress;
      localStorage.setItem(LOCAL_DAILY_SUCCESS_KEY, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Firestore fetch daily success progress warning, using local cache:', err);
  }

  // Fallback to local storage
  try {
    const cachedStr = localStorage.getItem(LOCAL_DAILY_SUCCESS_KEY);
    return cachedStr ? JSON.parse(cachedStr) : null;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// PAYPAL BUSINESS SUBSCRIPTION & 3-DAY FREE TRIAL FIRESTORE HELPERS
// -------------------------------------------------------------

export interface SubscriptionRecord {
  uid: string;
  userEmail: string;
  plan: string;
  paymentStatus: 'trial_active' | 'active' | 'canceled' | 'failed' | string;
  subscriptionStatus: 'in_trial' | 'active' | 'canceled' | 'expired' | string;
  paypalTransactionId: string;
  trialStartDate?: string;
  trialEndDate?: string;
  trialStatus?: 'active' | 'expired' | 'cancelled' | 'none' | string;
  nextBillingDate: string;
  createdAt: string;
  gateway: 'PayPal Business';
  billingCycle: 'monthly' | 'yearly';
  amountUSD: number;
  cancelAtPeriodEnd?: boolean;
}

export interface EmailNotificationRecord {
  id?: string;
  uid: string;
  userEmail: string;
  type: 'trial_started' | 'trial_24h_reminder' | 'subscription_activated' | 'subscription_cancelled';
  subject: string;
  body: string;
  sentAt: string;
  status: 'sent' | 'queued' | 'simulated';
}

export async function sendSaaSNotificationEmail(
  uid: string,
  type: 'trial_started' | 'trial_24h_reminder' | 'subscription_activated' | 'subscription_cancelled',
  userEmail: string,
  details: { plan?: string; trialEndDate?: string } = {}
): Promise<EmailNotificationRecord> {
  let subject = '';
  let body = '';

  const endStr = details.trialEndDate ? new Date(details.trialEndDate).toLocaleString() : 'in 3 days';
  const planName = details.plan || 'AI Career Pro';

  switch (type) {
    case 'trial_started':
      subject = `🚀 Welcome to your RYNEXO 3-Day Free Trial! (${planName})`;
      body = `Your 3-day free trial for RYNEXO ${planName} is now active. $0.00 was charged today via PayPal Business. You have full unlimited access to all AI Workers, Autopilot, and ATS Resume tools until ${endStr}. You can cancel anytime before the trial ends.`;
      break;
    case 'trial_24h_reminder':
      subject = `⏰ Reminder: Your RYNEXO 3-Day Free Trial ends in 24 hours`;
      body = `Your 3-day free trial for RYNEXO ${planName} will convert to a $29.00/month subscription tomorrow (${endStr}). Your authorized PayPal account will be billed automatically unless you cancel in your account settings.`;
      break;
    case 'subscription_activated':
      subject = `✅ Payment Successful: RYNEXO ${planName} Subscription Activated`;
      body = `Thank you for subscribing to RYNEXO ${planName}! Your monthly payment of $29.00 USD via PayPal Business has succeeded. Your subscription is active until the next billing cycle.`;
      break;
    case 'subscription_cancelled':
      subject = `🛑 RYNEXO Subscription Cancelled`;
      body = `Your RYNEXO ${planName} subscription has been cancelled as requested. Access to Premium AI features has been locked. You will not be billed again by PayPal.`;
      break;
  }

  const record: EmailNotificationRecord = {
    id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    uid: uid || 'guest',
    userEmail: userEmail || 'user@rynexo.com',
    type,
    subject,
    body,
    sentAt: new Date().toISOString(),
    status: 'sent',
  };

  // 1. Log to Firestore
  if (uid && uid !== 'guest') {
    try {
      const notifRef = doc(db, 'email_notifications', record.id!);
      await setDoc(notifRef, record, { merge: true });
    } catch (err) {
      console.warn('Firestore email notification log warning:', err);
    }
  }

  // 2. Dispatch to backend API
  try {
    fetch('/api/notifications/email-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(() => {});
  } catch (e) {}

  // 3. Save to local storage history cache
  try {
    const key = `rynexo_notifications_${uid || 'guest'}`;
    const existingStr = localStorage.getItem(key);
    const list: EmailNotificationRecord[] = existingStr ? JSON.parse(existingStr) : [];
    list.unshift(record);
    localStorage.setItem(key, JSON.stringify(list.slice(0, 20)));
  } catch (e) {}

  return record;
}

export async function startFreeTrialWithPaypal(
  uid: string,
  userEmail: string,
  plan: string = 'Pro',
  billingCycle: 'monthly' | 'yearly' = 'monthly',
  amountUSD: number = 29
): Promise<{ record: SubscriptionRecord; updatedUser: Partial<UserProfile> }> {
  const now = new Date();
  // 3 days free trial duration
  const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const paypalTxId = `PAYID-TRIAL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const record: SubscriptionRecord = {
    uid: uid || 'guest',
    userEmail: userEmail || 'user@rynexo.com',
    plan,
    paymentStatus: 'trial_active',
    subscriptionStatus: 'in_trial',
    trialStatus: 'active',
    trialStartDate: now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    paypalTransactionId: paypalTxId,
    nextBillingDate: trialEnd.toISOString(),
    createdAt: now.toISOString(),
    gateway: 'PayPal Business',
    billingCycle,
    amountUSD,
    cancelAtPeriodEnd: false,
  };

  const userUpdates: Partial<UserProfile> = {
    plan,
    subscriptionTier: plan.toLowerCase(),
    subscriptionStatus: 'in_trial',
    paymentStatus: 'trial_active',
    trialStatus: 'active',
    trialStartDate: now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    cancelAtPeriodEnd: false,
    paymentMethodAttached: true,
    paypalTransactionId: paypalTxId,
    nextBillingDate: trialEnd.toISOString(),
    subscriptionCreatedAt: now.toISOString(),
  };

  if (uid && uid !== 'guest') {
    try {
      // 1. Save document in `subscriptions` collection
      const subRef = doc(db, 'subscriptions', uid);
      await setDoc(subRef, record, { merge: true });

      // 2. Save document in `payment_transactions` collection
      const txRef = doc(db, 'payment_transactions', paypalTxId);
      await setDoc(txRef, {
        ...record,
        id: paypalTxId,
        status: 'Authorized Trial',
      });

      // 3. Update user profile document in `users` collection
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...userUpdates,
        updatedAt: now.toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore subscription update warning:', err);
    }
  }

  // Send Trial Started Email Reminder
  await sendSaaSNotificationEmail(uid, 'trial_started', userEmail, {
    plan,
    trialEndDate: trialEnd.toISOString(),
  });

  // Backup to localStorage cache
  try {
    localStorage.setItem(`rynexo_subscription_${uid || 'guest'}`, JSON.stringify(record));
    const localUser = localStorage.getItem('rynexo_user_session_v1');
    if (localUser) {
      const u = JSON.parse(localUser);
      localStorage.setItem('rynexo_user_session_v1', JSON.stringify({ ...u, ...userUpdates }));
    }
  } catch (e) {
    console.warn('Local storage save subscription warning:', e);
  }

  return { record, updatedUser: userUpdates };
}

export async function savePayPalSubscriptionToFirestore(
  uid: string,
  userEmail: string,
  plan: string = 'Pro',
  paypalSubscriptionId: string,
  status: 'active' | 'in_trial' | 'inactive' | 'canceled' = 'active',
  billingCycle: 'monthly' | 'yearly' = 'monthly',
  amountUSD: number = 29
): Promise<{ record: SubscriptionRecord; updatedUser: Partial<UserProfile> }> {
  const now = new Date();
  const nextBilling = new Date(now);
  if (billingCycle === 'yearly') {
    nextBilling.setFullYear(now.getFullYear() + 1);
  } else {
    nextBilling.setDate(now.getDate() + 30);
  }

  const subTxId = paypalSubscriptionId || `PAYID-SUB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const record: SubscriptionRecord = {
    uid: uid || 'guest',
    userEmail: userEmail || 'user@rynexo.com',
    plan,
    paymentStatus: status === 'active' ? 'Paid' : (status === 'in_trial' ? 'trial_active' : 'canceled'),
    subscriptionStatus: status,
    trialStatus: status === 'in_trial' ? 'active' : 'none',
    paypalTransactionId: subTxId,
    nextBillingDate: nextBilling.toISOString(),
    createdAt: now.toISOString(),
    gateway: 'PayPal Business',
    billingCycle,
    amountUSD,
    cancelAtPeriodEnd: false,
  };

  const userUpdates: Partial<UserProfile> = {
    plan,
    subscriptionPlan: plan,
    subscriptionTier: plan.toLowerCase(),
    subscriptionStatus: status,
    paymentStatus: status === 'active' ? 'Paid' : (status === 'in_trial' ? 'trial_active' : 'canceled'),
    paypalTransactionId: subTxId,
    paypalSubscriptionId: subTxId,
    subscriptionStart: now.toISOString(),
    subscriptionEnd: nextBilling.toISOString(),
    nextBillingDate: nextBilling.toISOString(),
    subscriptionCreatedAt: now.toISOString(),
    cancelAtPeriodEnd: false,
    paymentMethodAttached: true,
  };

  if (uid && uid !== 'guest') {
    try {
      const subRef = doc(db, 'subscriptions', uid);
      await setDoc(subRef, {
        userId: uid,
        subscriptionPlan: plan,
        subscriptionStatus: status,
        subscriptionStart: now.toISOString(),
        subscriptionEnd: nextBilling.toISOString(),
        nextBillingDate: nextBilling.toISOString(),
        paypalSubscriptionId: subTxId,
        updatedAt: now.toISOString(),
      }, { merge: true });

      const txRef = doc(db, 'payment_transactions', subTxId);
      await setDoc(txRef, {
        ...record,
        id: subTxId,
        userId: uid,
        status: status === 'active' ? 'Paid' : 'Trial Authorized',
      });

      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...userUpdates,
        userId: uid,
        updatedAt: now.toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore PayPal subscription update warning:', err);
    }
  }

  try {
    localStorage.setItem(`rynexo_subscription_${uid || 'guest'}`, JSON.stringify(record));
    const localUser = localStorage.getItem('rynexo_user_session_v1');
    if (localUser) {
      const u = JSON.parse(localUser);
      localStorage.setItem('rynexo_user_session_v1', JSON.stringify({ ...u, ...userUpdates }));
    }
  } catch (e) {}

  return { record, updatedUser: userUpdates };
}

export async function cancelUserSubscription(
  uid: string,
  userEmail: string
): Promise<Partial<UserProfile>> {
  const userUpdates: Partial<UserProfile> = {
    subscriptionStatus: 'canceled',
    trialStatus: 'cancelled',
    paymentStatus: 'canceled',
    cancelAtPeriodEnd: true,
  };

  if (uid && uid !== 'guest') {
    try {
      const subRef = doc(db, 'subscriptions', uid);
      await setDoc(subRef, {
        subscriptionStatus: 'canceled',
        trialStatus: 'cancelled',
        paymentStatus: 'canceled',
        cancelAtPeriodEnd: true,
        canceledAt: new Date().toISOString(),
      }, { merge: true });

      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...userUpdates,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore cancel subscription error:', err);
    }
  }

  // Send Subscription Cancelled Email
  await sendSaaSNotificationEmail(uid, 'subscription_cancelled', userEmail, {});

  // Update localStorage
  try {
    const localUser = localStorage.getItem('rynexo_user_session_v1');
    if (localUser) {
      const u = JSON.parse(localUser);
      localStorage.setItem('rynexo_user_session_v1', JSON.stringify({ ...u, ...userUpdates }));
    }
  } catch (e) {}

  return userUpdates;
}

export function isUserSubscriptionActive(user: UserProfile | null): boolean {
  if (!user) return false;

  // Immediately lock features if explicitly canceled or payment failed
  if (
    user.subscriptionStatus === 'canceled' ||
    user.subscriptionStatus === 'expired' ||
    user.trialStatus === 'cancelled' ||
    user.paymentStatus === 'canceled' ||
    user.paymentStatus === 'failed'
  ) {
    return false;
  }

  const now = new Date();

  // Check 3-Day Free Trial
  if (user.trialStatus === 'active' || user.subscriptionStatus === 'in_trial') {
    if (user.trialEndDate) {
      const endDate = new Date(user.trialEndDate);
      return now <= endDate;
    }
    return true;
  }

  // Check Active Paid Subscription
  if (user.subscriptionStatus === 'active' || user.paymentStatus === 'active' || user.paymentStatus === 'Paid') {
    return true;
  }

  return false;
}

export async function fetchUserEmailNotifications(uid: string): Promise<EmailNotificationRecord[]> {
  const key = `rynexo_notifications_${uid || 'guest'}`;
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return [];
}



