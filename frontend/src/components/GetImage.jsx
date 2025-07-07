const getSafeImageURL = (url) => {
    if (!url) return "";
    return url.replace("backend.lipsempirebyarielle.store", "lipsempirebyarielle.store");
  };
  