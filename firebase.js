// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadString
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// ==========================================
// FIREBASE CONFIG
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyARNIMr9CLKIFOt6AONAa4fYz-pe28yX4I",
  authDomain: "maja-ae9d0.firebaseapp.com",
  projectId: "maja-ae9d0",
  storageBucket: "maja-ae9d0.firebasestorage.app",
  messagingSenderId: "21674614341",
  appId: "1:21674614341:web:2f63073f1d0e1c3df04d2c"
};

// ==========================================
// INITIALIZE FIREBASE
// ==========================================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ==========================================
// EXPORT ALL MODULES
// ==========================================
export {
  app,
  auth,
  db,
  storage,
  // Auth functions
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  // Firestore functions
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  runTransaction,
  // Storage functions
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadString
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

// Get user profile from Firestore
export async function getUserProfile(uid) {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

// Create or update user profile
export async function setUserProfile(uid, data) {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error setting user profile:', error);
    return false;
  }
}

// Get all users
export async function getAllUsers() {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

// Get user's friends
export async function getUserFriends(uid) {
  try {
    const friendsRef = collection(db, 'users', uid, 'friends');
    const querySnapshot = await getDocs(friendsRef);
    const friends = [];
    querySnapshot.forEach((doc) => {
      friends.push({ id: doc.id, ...doc.data() });
    });
    return friends;
  } catch (error) {
    console.error('Error getting friends:', error);
    return [];
  }
}

// Add friend
export async function addFriend(uid, friendId, friendName) {
  try {
    const friendRef = doc(db, 'users', uid, 'friends', friendId);
    await setDoc(friendRef, {
      name: friendName,
      addedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error adding friend:', error);
    return false;
  }
}

// Remove friend
export async function removeFriend(uid, friendId) {
  try {
    const friendRef = doc(db, 'users', uid, 'friends', friendId);
    await deleteDoc(friendRef);
    return true;
  } catch (error) {
    console.error('Error removing friend:', error);
    return false;
  }
}

// Create a post
export async function createPost(userId, userName, userAvatar, text, image) {
  try {
    const postsRef = collection(db, 'posts');
    const docRef = await addDoc(postsRef, {
      userId: userId,
      user: userName,
      userAvatar: userAvatar || '',
      text: text || '',
      image: image || '',
      likes: 0,
      comments: 0,
      reposts: 0,
      liked: false,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

// Get all posts
export async function getAllPosts(limitCount = 50) {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    const posts = [];
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      // Get comments for this post
      const commentsRef = collection(db, 'posts', doc.id, 'comments');
      const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'), limit(20));
      const commentsSnapshot = await getDocs(commentsQuery);
      const comments = [];
      commentsSnapshot.forEach((cDoc) => {
        comments.push({ id: cDoc.id, ...cDoc.data() });
      });
      posts.push({ 
        id: doc.id, 
        ...data, 
        commentsList: comments 
      });
    }
    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
}

// Like a post
export async function likePost(postId, currentLiked, currentLikes) {
  try {
    const postRef = doc(db, 'posts', postId);
    const newLiked = !currentLiked;
    const newLikes = currentLikes + (newLiked ? 1 : -1);
    await updateDoc(postRef, {
      likes: newLikes,
      liked: newLiked
    });
    return { liked: newLiked, likes: newLikes };
  } catch (error) {
    console.error('Error liking post:', error);
    return null;
  }
}

// Add comment to a post
export async function addComment(postId, userId, userName, userAvatar, text) {
  try {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    await addDoc(commentsRef, {
      userId: userId,
      user: userName,
      userAvatar: userAvatar || '',
      text: text,
      createdAt: serverTimestamp()
    });
    // Update comment count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: increment(1)
    });
    return true;
  } catch (error) {
    console.error('Error adding comment:', error);
    return false;
  }
}

// Delete a post
export async function deletePost(postId) {
  try {
    // Delete all comments first
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const commentsSnapshot = await getDocs(commentsRef);
    for (const doc of commentsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    // Delete the post
    await deleteDoc(doc(db, 'posts', postId));
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
}

// Delete user account
export async function deleteUserAccount(uid, username) {
  try {
    // Delete all user's posts
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('userId', '==', uid));
    const postsSnapshot = await getDocs(q);
    for (const postDoc of postsSnapshot.docs) {
      // Delete comments for each post
      const commentsRef = collection(db, 'posts', postDoc.id, 'comments');
      const commentsSnapshot = await getDocs(commentsRef);
      for (const cDoc of commentsSnapshot.docs) {
        await deleteDoc(cDoc.ref);
      }
      await deleteDoc(postDoc.ref);
    }
    
    // Delete user document
    await deleteDoc(doc(db, 'users', uid));
    
    // Delete username
    if (username) {
      const usernameRef = doc(db, 'usernames', username.toLowerCase());
      await deleteDoc(usernameRef);
    }
    
    // Delete user friends subcollection
    const friendsRef = collection(db, 'users', uid, 'friends');
    const friendsSnapshot = await getDocs(friendsRef);
    for (const fDoc of friendsSnapshot.docs) {
      await deleteDoc(fDoc.ref);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting user account:', error);
    return false;
  }
}

// Upload profile picture
export async function uploadProfilePicture(uid, imageData) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      avatar: imageData
    });
    return imageData;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return null;
  }
}

// Check if username is available
export async function isUsernameAvailable(username) {
  try {
    const usernameRef = doc(db, 'usernames', username.toLowerCase());
    const docSnap = await getDoc(usernameRef);
    return !docSnap.exists();
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
}

// Reserve username
export async function reserveUsername(username, uid) {
  try {
    const usernameRef = doc(db, 'usernames', username.toLowerCase());
    await setDoc(usernameRef, {
      uid: uid,
      username: username.toLowerCase(),
      reservedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error reserving username:', error);
    return false;
  }
}

console.log('🔥 Firebase initialized successfully!');
console.log('📁 Project: maja-ae9d0');
console.log('👤 Auth: Email/Password enabled');
console.log('📊 Firestore: Ready');
console.log('📦 Storage: Ready');
