// /pages/invite/[token].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function InvitePage() {
  const router = useRouter();
  const { token } = router.query;
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/public-join?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else {
          setProject(data.project);

          // If no guest id exists, assign one
          if (!localStorage.getItem("guestId")) {
            localStorage.setItem("guestId", crypto.randomUUID());
          }
        }
      });
  }, [token]);

  if (error) return <p>Error: {error}</p>;
  if (!project) return <p>Loading project...</p>;

  return (
    <div>
      <h1>Project: {project.name}</h1>
      {/* Mount your TeamPlanner UI here */}
    </div>
  );
}
