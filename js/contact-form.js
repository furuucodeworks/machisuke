(function (global) {
  var STORAGE_KEY = "machisukeContactDraft";
  var DB_NAME = "machisukeContact";
  var STORE_NAME = "files";
  var PHOTO_KEY = "photo";
  var TO_EMAIL = "machisuke.takato@gmail.com";
  var MAX_PHOTO_BYTES = 8 * 1024 * 1024;
  var REPLY_LABELS = { phone: "電話", email: "メール" };

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        if (!req.result.objectStoreNames.contains(STORE_NAME)) {
          req.result.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = function () {
        resolve(req.result);
      };
      req.onerror = function () {
        reject(req.error);
      };
    });
  }

  function savePhoto(file) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, "readwrite");
        if (file) tx.objectStore(STORE_NAME).put(file, PHOTO_KEY);
        else tx.objectStore(STORE_NAME).delete(PHOTO_KEY);
        tx.oncomplete = function () {
          resolve();
        };
        tx.onerror = function () {
          reject(tx.error);
        };
      });
    });
  }

  function loadPhoto() {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(PHOTO_KEY);
        req.onsuccess = function () {
          resolve(req.result || null);
        };
        req.onerror = function () {
          reject(req.error);
        };
      });
    });
  }

  function saveDraft(data) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadDraft() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function clearDraft() {
    sessionStorage.removeItem(STORAGE_KEY);
    return savePhoto(null);
  }

  function collectForm(form) {
    var data = new FormData(form);
    return {
      name: String(data.get("name") || "").trim(),
      tel: String(data.get("tel") || "").trim(),
      email: String(data.get("email") || "").trim(),
      reply_method: String(data.get("reply_method") || "phone"),
      message: String(data.get("message") || "").trim(),
      photoName: "",
      privacy: data.get("privacy") === "agreed",
    };
  }

  function validatePhoto(file) {
    if (!file) return "";
    if (file.size > MAX_PHOTO_BYTES) {
      return "写真は8MB以下のファイルを選択してください。";
    }
    return "";
  }

  function sendInquiry(data, file) {
    var formData = new FormData();
    formData.append("_subject", "【便利屋まち助】お問い合わせ");
    formData.append("_template", "table");
    formData.append("_captcha", "false");
    formData.append("_replyto", data.email);
    formData.append("_url", window.location.href);
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("message", data.message);
    formData.append("お名前", data.name);
    formData.append("電話番号", data.tel || "未入力");
    formData.append("メールアドレス", data.email);
    formData.append("ご希望の返信方法", REPLY_LABELS[data.reply_method] || data.reply_method);
    formData.append("お問い合わせ内容", data.message);
    formData.append("個人情報の取り扱い", "同意済み");
    if (file) formData.append("写真", file, file.name);

    return fetch("https://formsubmit.co/ajax/" + TO_EMAIL, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    }).then(function (response) {
      return response.json().then(function (json) {
        var message = String(json && json.message ? json.message : "");
        if (/activat/i.test(message)) {
          var error = new Error(message);
          error.code = "activation";
          throw error;
        }
        if (!response.ok || json.success === false || json.success === "false") {
          throw new Error(message || "送信に失敗しました。");
        }
        return json;
      }, function () {
        throw new Error("送信に失敗しました。");
      });
    });
  }

  global.MachisukeContact = {
    REPLY_LABELS: REPLY_LABELS,
    collectForm: collectForm,
    saveDraft: saveDraft,
    loadDraft: loadDraft,
    clearDraft: clearDraft,
    savePhoto: savePhoto,
    loadPhoto: loadPhoto,
    validatePhoto: validatePhoto,
    sendInquiry: sendInquiry,
  };
})(window);
