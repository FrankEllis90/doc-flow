/**
 * Debug script to clear corrupted autosave data
 * Run this in browser console to fix the placeholder chunk issue
 */

console.log('🔧 Doc Layer - Debug: Clearing corrupted autosave data...');

// Clear IndexedDB autosave
if ('indexedDB' in window) {
  const deleteRequest = indexedDB.deleteDatabase('doc-layer-storage');
  deleteRequest.onsuccess = () => {
    console.log('✅ Cleared IndexedDB autosave data');
  };
  deleteRequest.onerror = () => {
    console.log('⚠️ Failed to clear IndexedDB, trying localStorage...');
  };
}

// Clear localStorage autosave
const keys = [
  'contentbuilder_autosave',
  'contentbuilder_autosave_fallback',
  'doc-layer-autosave',
  'ragara-autosave'
];

keys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Cleared localStorage key: ${key}`);
  }
});

// Clear sessionStorage autosave
keys.forEach(key => {
  if (sessionStorage.getItem(key)) {
    sessionStorage.removeItem(key);
    console.log(`✅ Cleared sessionStorage key: ${key}`);
  }
});

console.log('🎉 Autosave cleanup complete! Refresh the page to start with clean data.');
console.log('📝 Now try creating new content - it should display the actual content instead of placeholders.');