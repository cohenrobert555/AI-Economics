import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { Octokit } from "octokit";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // --- GitHub OAuth ---
  
  app.get("/api/auth/github/url", (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: "GITHUB_CLIENT_ID not configured in Secrets" });
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
    res.json({ url });
  });

  app.get("/auth/github/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!code || !clientId || !clientSecret) {
      return res.status(400).send("Missing code or GitHub configuration");
    }

    try {
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const data = await response.json();
      const accessToken = data.access_token;

      if (!accessToken) {
        return res.status(401).send("Failed to get access token from GitHub");
      }

      // Send success message to parent window and close popup
      res.send(`
        <html>
          <body style="background: #0a0a0a; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <h2 style="color: #00ff00;">✓ GitHub Connected</h2>
              <p>This window will close automatically.</p>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', token: '${accessToken}' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("GitHub Auth Error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  // --- GitHub Push Logic ---

  app.post("/api/github/push", async (req, res) => {
    const { token, repoName, description } = req.body;
    if (!token || !repoName) {
      return res.status(400).json({ error: "Missing token or repository name" });
    }

    const octokit = new Octokit({ auth: token });

    try {
      // 1. Get user info
      const { data: user } = await octokit.rest.users.getAuthenticated();
      const owner = user.login;

      // 2. Create or get repo
      let repo;
      try {
        const { data } = await octokit.rest.repos.get({ owner, repo: repoName });
        repo = data;
      } catch (e) {
        const { data } = await octokit.rest.repos.createForAuthenticatedUser({
          name: repoName,
          description: description || "AI Economics Project Export",
          private: false,
          auto_init: true,
        });
        repo = data;
      }

      // 3. Read files recursively
      const files: { path: string; content: string }[] = [];
      const ignoreList = ['node_modules', 'dist', '.git', '.env', 'package-lock.json', '.DS_Store'];

      function readDir(dir: string, relativePath = "") {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          if (ignoreList.includes(item)) continue;
          const fullPath = path.join(dir, item);
          const relPath = path.join(relativePath, item);
          const stats = fs.statSync(fullPath);

          if (stats.isDirectory()) {
            readDir(fullPath, relPath);
          } else {
            const content = fs.readFileSync(fullPath, 'utf8');
            files.push({ path: relPath, content });
          }
        }
      }

      readDir(process.cwd());

      // 4. Push files (using Tree API for efficiency)
      // Get the latest commit on the default branch
      const { data: ref } = await octokit.rest.git.getRef({
        owner,
        repo: repoName,
        ref: `heads/${repo.default_branch || 'main'}`,
      });
      const latestCommitSha = ref.object.sha;

      // Create blobs for each file
      const treeItems = await Promise.all(files.map(async (file) => {
        const { data: blob } = await octokit.rest.git.createBlob({
          owner,
          repo: repoName,
          content: file.content,
          encoding: 'utf-8',
        });
        return {
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        };
      }));

      // Create a new tree
      const { data: newTree } = await octokit.rest.git.createTree({
        owner,
        repo: repoName,
        base_tree: latestCommitSha,
        tree: treeItems as any,
      });

      // Create a new commit
      const { data: newCommit } = await octokit.rest.git.createCommit({
        owner,
        repo: repoName,
        message: `Export from AI Studio Build - ${new Date().toISOString()}`,
        tree: newTree.sha,
        parents: [latestCommitSha],
      });

      // Update the ref
      await octokit.rest.git.updateRef({
        owner,
        repo: repoName,
        ref: `heads/${repo.default_branch || 'main'}`,
        sha: newCommit.sha,
      });

      res.json({ success: true, url: repo.html_url });
    } catch (error: any) {
      console.error("GitHub Push Error:", error);
      res.status(500).json({ error: error.message || "Failed to push to GitHub" });
    }
  });

  // --- Vite Middleware ---
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
