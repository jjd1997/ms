const contentPath = "src/content/site-content.json";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1024 * 1024) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function githubRequest(url, token, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "ms-content-studio",
      "X-GitHub-Api-Version": "2022-11-28",
      ...init.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const message = data?.message || `GitHub request failed with ${response.status}`;
    throw new Error(message);
  }

  return data;
}

async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "jjd1997";
  const repo = process.env.GITHUB_REPO || "ms";
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token) {
    sendJson(response, 500, {
      error: "Missing GITHUB_TOKEN environment variable.",
    });
    return;
  }

  try {
    const body = await readRequestBody(request);
    const payload = JSON.parse(body);

    if (!payload?.content || typeof payload.content !== "object") {
      sendJson(response, 400, { error: "Missing content object." });
      return;
    }

    const nextContent = `${JSON.stringify(payload.content, null, 2)}\n`;
    const encodedContent = Buffer.from(nextContent, "utf8").toString("base64");
    const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${contentPath}`;
    const currentFile = await githubRequest(`${fileUrl}?ref=${encodeURIComponent(branch)}`, token);

    const commit = await githubRequest(fileUrl, token, {
      method: "PUT",
      body: JSON.stringify({
        branch,
        content: encodedContent,
        message: payload.message || "Update site content from studio",
        sha: currentFile.sha,
      }),
    });

    sendJson(response, 200, {
      commit: commit.commit?.sha,
      htmlUrl: commit.commit?.html_url,
      ok: true,
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unknown save error.",
    });
  }
}

module.exports = handler;
