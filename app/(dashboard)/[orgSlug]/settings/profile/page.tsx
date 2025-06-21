import { UserProfile } from "@clerk/nextjs";
import React from "react";

const Profile = () => {
  return (
    <div>
      <UserProfile
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "shadow-none border-0",
          },
        }}
      />
    </div>
  );
};

export default Profile;
