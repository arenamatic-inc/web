import { useAuth } from "./auth/useAuth";

export default function Account() {
  const { user } = useAuth();

  if (!user) return <div className="p-8 text-white">Not logged in.</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 text-white">
      <h1 className="text-2xl font-bold mb-6">Account</h1>
      <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
