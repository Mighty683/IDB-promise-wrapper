/**
 * Get data from app data store.
 * https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction
 * https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore
 * @param {string} key - optional key to get from object
 * @returns {*}
 */

function getFromDB (key) {
  return new Promise((resolve, reject) => {
    let transaction = this.database.transaction([this.storeName], 'readwrite');
    let dataRequest = transaction.objectStore(this.storeName).get(1);
    transaction.oncomplete = resolve(new Promise((resolve, reject) => {
      dataRequest.onerror = reject;
      dataRequest.onsuccess = (event) => resolve(key && event.target.result ? event.target.result[key] : event.target.result);
    }));
    transaction.onerror = reject;
  });
}

/**
 * Save data to app data store.
 * https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction
 * https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore
 * @param {string} key - key to save
 * @param {*} value - value to save
 * @returns {*}
 */
function saveToDB (key, value) {
  return new Promise((resolve, reject) => {
    return this.getFromDB().then(dataObject => {
      if (dataObject) {
        dataObject[key] = value;
      } else {
        dataObject = {
          [key]: value,
        };
      }
      let transaction = this.database.transaction([this.storeName], 'readwrite');
      let dataRequest = transaction.objectStore(this.storeName).put(dataObject, 1);
      transaction.oncomplete = resolve(new Promise((resolve, reject) => {
        dataRequest.onerror = reject;
        dataRequest.onsuccess = () => resolve(value);
      }));
      transaction.onerror = reject;
    });
  });
}

/**
 * Creates Database Manager
 * @class
 * @classdesc Allows to perform basic operations on database.
 * @property {IDBDatabase} database
 * @property {saveToDB} saveToDB
 * @property {getFromDB} getFromDB
 * @param {IDBDatabase} database
 */
function DBManager (database, storeName) {
  this.database = database;
  this.storeName = storeName;
  this.saveToDB = saveToDB;
  this.getFromDB = getFromDB;
}

/**
 * Opens database connection.
 * https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest
 * @returns {Promise<DBManager>}
 */
DBManager.openDB = function (dataBaseName, storeName) {
  return new Promise((resolve, reject) => {
    let openRequest = indexedDB.open(dataBaseName, 1);
    openRequest.onsuccess = () => resolve(new DBManager(openRequest.result, storeName));
    openRequest.onupgradeneeded = () => {
      let db =  openRequest.result;
      db.onerror = reject;
      db.createObjectStore(storeName, { autoIncrement: true });
      db.onversionchange = resolve;
    };
    openRequest.onblocked = reject;
    openRequest.onerror = reject;
  });
};


module.exports = DBManager;
