import fs from "node:fs/promises";
import path from "node:path";
import { getGitHubRepoConfig } from "./config";
import type { LinkedInAutomationRun } from "./types";

const RUNS_DIR = "content-system/linkedin-runs";

type GitHubContentFile = {
  name: string;
  path: string;
  sha: string;
  content?: string;
  type: "file" | "dir";
};

export function runPath(runId: string) {
  return `${RUNS_DIR}/${runId}.json`;
}

export async function getAutomationRun(runId: string) {
  const github = getGitHubRepoConfig();

  if (github.configured) {
    const file = await fetchGitHubFile(runPath(runId));
    if (!file?.content) return null;

    return JSON.parse(Buffer.from(file.content, "base64").toString("utf8")) as LinkedInAutomationRun;
  }

  return readLocalRun(runId);
}

export async function listAutomationRuns() {
  const github = getGitHubRepoConfig();

  if (github.configured) {
    const files = await listGitHubDirectory(RUNS_DIR);
    const runs = await Promise.all(
      files
        .filter((file) => file.type === "file" && file.name.endsWith(".json"))
        .map(async (file) => {
          const content = await fetchGitHubFile(file.path);
          if (!content?.content) return null;
          return JSON.parse(Buffer.from(content.content, "base64").toString("utf8")) as LinkedInAutomationRun;
        }),
    );

    return runs.filter((run): run is LinkedInAutomationRun => Boolean(run));
  }

  return readLocalRuns();
}

export async function saveAutomationRun(run: LinkedInAutomationRun, message: string) {
  const github = getGitHubRepoConfig();

  if (!github.configured) {
    return {
      ok: false,
      reason: "GitHub content storage is not configured.",
    };
  }

  const filePath = runPath(run.id);
  const existing = await fetchGitHubFile(filePath);

  return putGitHubFile({
    path: filePath,
    content: JSON.stringify(run, null, 2) + "\n",
    message,
    sha: existing?.sha,
  });
}

export async function publishGeneratedFiles(files: Array<{ path: string; content: string }>, message: string) {
  const github = getGitHubRepoConfig();

  if (!github.configured) {
    return {
      ok: false,
      reason: "GitHub content publishing is not configured.",
    };
  }

  for (const file of files) {
    const existing = await fetchGitHubFile(file.path);
    const result = await putGitHubFile({
      path: file.path,
      content: file.content,
      message,
      sha: existing?.sha,
    });

    if (!result.ok) {
      return result;
    }
  }

  return {
    ok: true,
  };
}

async function readLocalRun(runId: string) {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), runPath(runId)), "utf8");
    return JSON.parse(raw) as LinkedInAutomationRun;
  } catch {
    return null;
  }
}

async function readLocalRuns() {
  try {
    const dir = path.join(process.cwd(), RUNS_DIR);
    const files = await fs.readdir(dir);
    const runs = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map((file) => fs.readFile(path.join(dir, file), "utf8").then((raw) => JSON.parse(raw) as LinkedInAutomationRun)),
    );

    return runs;
  } catch {
    return [];
  }
}

async function fetchGitHubFile(filePath: string): Promise<GitHubContentFile | null> {
  const github = getGitHubRepoConfig();
  const response = await fetch(
    `https://api.github.com/repos/${github.repo}/contents/${filePath}?ref=${github.branch}`,
    {
      headers: githubHeaders(github.token),
      cache: "no-store",
    },
  );

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("GitHub content read failed.");

  return response.json() as Promise<GitHubContentFile>;
}

async function listGitHubDirectory(dirPath: string): Promise<GitHubContentFile[]> {
  const github = getGitHubRepoConfig();
  const response = await fetch(
    `https://api.github.com/repos/${github.repo}/contents/${dirPath}?ref=${github.branch}`,
    {
      headers: githubHeaders(github.token),
      cache: "no-store",
    },
  );

  if (response.status === 404) return [];
  if (!response.ok) throw new Error("GitHub content directory read failed.");

  return response.json() as Promise<GitHubContentFile[]>;
}

async function putGitHubFile({
  path: filePath,
  content,
  message,
  sha,
}: {
  path: string;
  content: string;
  message: string;
  sha?: string;
}) {
  const github = getGitHubRepoConfig();
  const response = await fetch(`https://api.github.com/repos/${github.repo}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      ...githubHeaders(github.token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch: github.branch,
      sha,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      reason: `GitHub content write failed with ${response.status}.`,
    };
  }

  return {
    ok: true,
  };
}

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}
