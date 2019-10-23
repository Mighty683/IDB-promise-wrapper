
/**
 * Opens database connection.
 * https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest
 */
function openUserDB () {
  return new Promise((resolve, reject) => {
    let openRequest = indexedDB.open('app_data', 1);
    openRequest.onsuccess = () => resolve(openRequest.result);
    openRequest.onupgradeneeded = () => {
      let db =  openRequest.result;
      db.onerror = reject;
      db.createObjectStore('app_data', { autoIncrement: true });
      db.onversionchange = resolve;
    };
    openRequest.onblocked = reject;
    openRequest.onerror = reject;
  });
}

/**
 * Get data from app data store.
 * https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction
 * https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore
 * @param {string} key - optional key to get from object
 */
function getAppDataFromDB (key) {
  return openUserDB().then(db => new Promise((resolve, reject) => {
    let transaction = db.transaction(['app_data'], 'readwrite');
    let dataRequest = transaction.objectStore('app_data').get(1);
    transaction.oncomplete = resolve(new Promise((resolve, reject) => {
      dataRequest.onerror = reject;
      dataRequest.onsuccess = (event) => resolve(key && event.target.result ? event.target.result[key] : event.target.result);
    }));
    transaction.onerror = reject;
  }));
}

/**
 * Save data to app data store.
 * https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction
 * https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore
 * @param {string} key - key to save
 * @param {*} value - value to save
 */
function saveAppDataToDB (key, value) {
  return openUserDB().then().then(db => new Promise((resolve, reject) => {
    return getAppDataFromDB().then(dataObject => {
      if (dataObject) {
        dataObject[key] = value;
      } else {
        dataObject = {
          [key]: value,
        };
      }
      let transaction = db.transaction(['app_data'], 'readwrite');
      let dataRequest = transaction.objectStore('app_data').put(dataObject, 1);
      transaction.oncomplete = resolve(new Promise((resolve, reject) => {
        dataRequest.onerror = reject;
        dataRequest.onsuccess = () => resolve(value);
      }));
      transaction.onerror = reject;
    });
  }));
}
