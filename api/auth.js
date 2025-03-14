export default function handler(req, res) {
  const isLoggedIn = req.cookies?.token;

  if (isLoggedIn) {
    res.writeHead(302, { Location: '/homepage.html' }); // Redirect to homepage if logged in
  } else {
    res.writeHead(302, { Location: '/index.html' }); // Redirect to login page if not logged in
  }
  res.end();
}
