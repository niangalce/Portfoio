export interface GitHubRepositoryMetadata {
  description: string | null;
  stars: number;
  updatedAt: Date;
}

export async function fetchPublicRepositoryMetadata(
  owner: string,
  repository: string,
  signal?: AbortSignal
): Promise<GitHubRepositoryMetadata> {
  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repository)) {
    throw new Error('Invalid GitHub repository identifier.');
  }

  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`,
    {
      headers: { Accept: 'application/vnd.github+json' },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub repository request failed with status ${response.status}.`);
  }

  const data: unknown = await response.json();
  if (typeof data !== 'object' || data === null) {
    throw new Error('GitHub returned repository metadata in an unexpected format.');
  }

  const repositoryData = data as Record<string, unknown>;
  const stars = repositoryData.stargazers_count;
  const updatedAt = typeof repositoryData.updated_at === 'string'
    ? new Date(repositoryData.updated_at)
    : new Date(Number.NaN);

  if (
    (repositoryData.description !== null && typeof repositoryData.description !== 'string') ||
    typeof stars !== 'number' ||
    !Number.isSafeInteger(stars) ||
    stars < 0 ||
    Number.isNaN(updatedAt.getTime())
  ) {
    throw new Error('GitHub returned repository metadata in an unexpected format.');
  }

  return {
    description: repositoryData.description,
    stars,
    updatedAt
  };
}
