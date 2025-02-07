import { useRouter } from "next/navigation";

interface RepositoryCardProps {
  repo: any;
}

export const RepositoryCard = ({ repo }: RepositoryCardProps) => {
  const router = useRouter();

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h3 className="card-title">{repo.name}</h3>
          <button onClick={() => router.push(`/repo?link=${repo.full_name}`)} className="btn btn-secondary btn-sm">
            View Contributors
          </button>
        </div>
        <p className="text-sm opacity-70">{repo.description}</p>
        <div className="card-actions justify-start mt-2">
          <div className="badge badge-outline">⭐ {repo.stargazers_count}</div>
          <div className="badge badge-outline">🍴 {repo.forks_count}</div>
          <div className="badge badge-outline">👀 {repo.watchers_count}</div>
        </div>
      </div>
    </div>
  );
};
