import { useProfile } from "@farcaster/auth-kit";

export const UserProfile = () => {
    const {
      isAuthenticated,
      profile: { username, fid },
    } = useProfile();
    return (
      <div>
        {isAuthenticated ? (
          <p>
            Hello, {username}! Your fid is: {fid}
          </p>
        ) : (
          <p>You're not signed in.</p>
        )}
      </div>
    );
  };