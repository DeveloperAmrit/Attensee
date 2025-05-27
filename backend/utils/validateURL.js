exports.validateImageUrl = (url)=> {
     if (typeof url !== 'string') return false;

  try {
    new URL(url); // Will throw if not a valid URL
    return true;
  } catch {
    return false;
  }
}
