export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = "guigarmon3.online";
    return Response.redirect(url.toString(), 301);
  },
};
