export function getAuthToken(req, source = "cookie") {
  if (source === "header") {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      return header.split(" ")[1];
    }
    return null;
  }

  if (source === "cookie") {
    return req.cookies?.access_token || null;
  }

  if (source === "both") {
    return (
      req.cookies?.access_token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null)
    );
  }

  return null;
}
