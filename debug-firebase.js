/**
 * Firebase Integration Debug Script
 * Run this in browser console to diagnose Firebase storage issues
 */

window.debugFirebaseIntegration = () => {
  console.log('🔍 === FIREBASE INTEGRATION DIAGNOSTICS ===');
  
  // 1. Check environment variables (these should be visible in production build)
  console.log('\n📋 1. CHECKING ENVIRONMENT CONFIGURATION...');
  try {
    // Check if we're in development
    const isDev = window.location.hostname === 'localhost';
    console.log(`Environment: ${isDev ? 'Development' : 'Production'}`);
    
    // Try to detect if Firebase config is loaded
    const scripts = Array.from(document.scripts);
    const hasFirebaseScript = scripts.some(script => 
      script.src.includes('firebase') || script.innerHTML.includes('firebase')
    );
    console.log(`Firebase scripts detected: ${hasFirebaseScript}`);
    
  } catch (error) {
    console.error('❌ Environment check failed:', error);
  }
  
  // 2. Check authentication state
  console.log('\n📋 2. CHECKING AUTHENTICATION STATE...');
  try {
    // Look for auth-related elements in DOM
    const authElements = {
      signInButton: document.querySelector('button') && 
                   Array.from(document.querySelectorAll('button'))
                        .find(btn => btn.textContent.toLowerCase().includes('sign')),
      userProfile: document.querySelector('[data-user]') || 
                  document.querySelector('.user') ||
                  document.querySelector('[role="button"][aria-label*="user"]'),
      authContainer: document.querySelector('[data-auth]') ||
                    document.querySelector('.auth')
    };
    
    console.log('Auth elements found:', {
      signInButton: !!authElements.signInButton,
      userProfile: !!authElements.userProfile,
      authContainer: !!authElements.authContainer
    });
    
    if (authElements.signInButton) {
      console.log('⚠️ Sign in button text:', authElements.signInButton.textContent);
    }
    
  } catch (error) {
    console.error('❌ Auth state check failed:', error);
  }
  
  // 3. Check local storage
  console.log('\n📋 3. CHECKING LOCAL STORAGE...');
  try {
    const storageKeys = Object.keys(localStorage);
    const codeGuardianKeys = storageKeys.filter(key => 
      key.toLowerCase().includes('codeguardian') || 
      key.toLowerCase().includes('firebase') ||
      key.toLowerCase().includes('auth')
    );
    
    console.log('Total localStorage keys:', storageKeys.length);
    console.log('Code Guardian related keys:', codeGuardianKeys);
    
    codeGuardianKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        const parsed = JSON.parse(value);
        console.log(`📄 ${key}:`, {
          type: typeof parsed,
          hasData: !!parsed,
          keys: typeof parsed === 'object' ? Object.keys(parsed) : []
        });
      } catch (parseError) {
        console.log(`📄 ${key}: (raw string, length: ${value?.length || 0})`);
      }
    });
    
  } catch (error) {
    console.error('❌ Local storage check failed:', error);
  }
  
  // 4. Check for analysis workflow
  console.log('\n📋 4. CHECKING ANALYSIS WORKFLOW...');
  try {
    // Look for file input
    const fileInput = document.querySelector('input[type="file"]');
    console.log('File input found:', !!fileInput);
    
    if (fileInput) {
      console.log('File input accept:', fileInput.accept);
      console.log('File input multiple:', fileInput.multiple);
    }
    
    // Look for upload area
    const uploadAreas = document.querySelectorAll('[data-testid*="upload"], .upload, [role="button"]');
    console.log('Upload areas found:', uploadAreas.length);
    
    // Look for results area
    const resultsArea = document.querySelector('[data-testid*="results"], .results, .analysis');
    console.log('Results area found:', !!resultsArea);
    
  } catch (error) {
    console.error('❌ Analysis workflow check failed:', error);
  }
  
  // 5. Network/console error check
  console.log('\n📋 5. RECENT CONSOLE ERRORS (check manually)...');
  console.log('🔍 Look for any errors containing these terms:');
  console.log('   • "Firebase"');
  console.log('   • "auth"'); 
  console.log('   • "Firestore"');
  console.log('   • "handleAnalysisComplete"');
  console.log('   • "analysisIntegrationService"');
  
  // 6. Provide next steps
  console.log('\n📋 6. RECOMMENDATIONS...');
  console.log('Based on the diagnostics above:');
  console.log('');
  console.log('🔧 If no auth elements found:');
  console.log('   → Ensure you are signed in to the application');
  console.log('');
  console.log('🔧 If no localStorage data:'); 
  console.log('   → Try uploading and analyzing a file first');
  console.log('');
  console.log('🔧 If Firebase scripts not detected:');
  console.log('   → Check .env.local file has valid Firebase config');
  console.log('');
  console.log('🔧 If analysis not triggering:');
  console.log('   → Check browser console for errors during upload');
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Upload a ZIP file through the app');
  console.log('2. Watch console for analysis messages');
  console.log('3. Check if handleAnalysisComplete is called');
  console.log('4. Verify Firebase config in .env.local');
  
  return 'Diagnostics completed - check console output above';
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('🚀 Firebase Debug Script Loaded');
  console.log('💡 Run: debugFirebaseIntegration()');
  console.log('');
}
