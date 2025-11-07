const server = Bun.serve({
  port: 4000,
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname === "/" ? "/index.html" : url.pathname;

    try {
      const file = Bun.file(`./public${filePath}`);
      if (await file.exists()) {
        return new Response(file);
      }
    } catch (e) {}

    // Fallback to index.html for Angular routing
    return new Response(Bun.file("./public/index.html"));
  },
});

console.log(`Frontend server running on http://localhost:${server.port}`);
