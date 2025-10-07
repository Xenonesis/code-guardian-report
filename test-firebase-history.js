/**
 * Firebase History Test Script
 * Run this in the browser console to test the history functionality
 */

window.testFirebaseHistory = async () => {
  console.log('🔥 === FIREBASE HISTORY INTEGRATION TEST ===');
  
  try {
    // 1. Check if user is authenticated
    console.log('\n📋 1. AUTHENTICATION CHECK:');
    const currentUser = window.firebase?.auth()?.currentUser;
    console.log('   Current user:', currentUser?.uid || 'Not authenticated');
    console.log('   User email:', currentUser?.email || 'N/A');
    
    if (!currentUser) {
      console.error('❌ No user authenticated! Please sign in first.');
      return false;
    }

    // 2. Test Firebase connection
    console.log('\n📋 2. FIREBASE CONNECTION TEST:');
    const { firebaseAnalysisStorage } = await import('/src/services/firebaseAnalysisStorage.ts');
    console.log('   Firebase service imported successfully');
    
    // Set user ID
    firebaseAnalysisStorage.setUserId(currentUser.uid);
    console.log('   User ID set in service');

    // 3. Test getUserStats
    console.log('\n📋 3. TESTING USER STATS:');
    try {
      const stats = await firebaseAnalysisStorage.getUserStats(currentUser.uid);
      console.log('   User stats:', stats);
      
      if (stats.totalAnalyses === 0) {
        console.log('   ⚠️ No analyses found for this user');
      }
    } catch (error) {
      console.error('   ❌ Error getting user stats:', error);
    }

    // 4. Test getUserAnalysisHistory
    console.log('\n📋 4. TESTING ANALYSIS HISTORY:');
    try {
      const history = await firebaseAnalysisStorage.getUserAnalysisHistory(currentUser.uid);
      console.log('   Analysis history:', history);
      console.log('   Number of analyses:', history.length);
      
      if (history.length > 0) {
        console.log('   ✅ Found analysis data!');
        history.forEach((analysis, index) => {
          console.log(`   Analysis ${index + 1}:`, {
            id: analysis.id,
            fileName: analysis.fileName,
            userId: analysis.userId,
            createdAt: analysis.createdAt,
            issuesCount: analysis.results?.issues?.length || 0
          });
        });
      } else {
        console.log('   ⚠️ No analysis history found');
      }
    } catch (error) {
      console.error('   ❌ Error getting analysis history:', error);
    }

    // 5. Test direct Firestore query
    console.log('\n📋 5. TESTING DIRECT FIRESTORE QUERY:');
    try {
      const { db } = await import('/src/lib/firebase.ts');
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      const q = query(
        collection(db, 'analysisResults'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      console.log('   Direct Firestore query results:', querySnapshot.size, 'documents');
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('   Document:', doc.id, {
          fileName: data.fileName,
          userId: data.userId,
          createdAt: data.createdAt,
          hasResults: !!data.results
        });
      });
      
      if (querySnapshot.empty) {
        console.log('   ⚠️ No documents found in Firestore for this user');
        console.log('   💡 This means no analysis has been stored to Firebase yet');
      }
      
    } catch (error) {
      console.error('   ❌ Error with direct Firestore query:', error);
    }

    // 6. Test user stats collection
    console.log('\n📋 6. TESTING USER STATS COLLECTION:');
    try {
      const { db } = await import('/src/lib/firebase.ts');
      const { doc, getDoc } = await import('firebase/firestore');
      
      const userStatsRef = doc(db, 'userStats', currentUser.uid);
      const userStatsDoc = await getDoc(userStatsRef);
      
      if (userStatsDoc.exists()) {
        console.log('   ✅ User stats document found:', userStatsDoc.data());
      } else {
        console.log('   ⚠️ No user stats document found');
        console.log('   💡 This is normal if no analysis has been completed yet');
      }
      
    } catch (error) {
      console.error('   ❌ Error checking user stats collection:', error);
    }

    console.log('\n🎯 SUMMARY:');
    console.log('✅ Firebase test completed');
    console.log('💡 If no data is found:');
    console.log('   1. Upload and analyze a ZIP file first');
    console.log('   2. Check browser console for analysis completion messages');
    console.log('   3. Ensure analysis integration service is working');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Auto-run information
console.log('🚀 Firebase History Test Script Loaded');
console.log('💡 Run: testFirebaseHistory()');
console.log('📋 Make sure you are signed in first!');
