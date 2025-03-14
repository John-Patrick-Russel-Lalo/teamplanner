export default function handler(req, res) {
  const isLoggedIn = req.cookies?.token; // Example: Check if a token exists in cookies

  if (isLoggedIn) {
    res.writeHead(302, { Location: '/homepage.html' }); // Redirect to homepage if logged in
    res.end();
  } else {
    res.writeHead(302, { Location: '/login.html' }); // Redirect to login page if not logged in
    res.end();
  }
}
