import { UserProfile } from "@clerk/nextjs";

const ProfilePage = () => {
  return (
    <div className="flex justify-center py-8">
      <div className="max-w-sm w-full">
        <UserProfile
          routing="hash"
          appearance={{
            elements: {
              card: "bg-white shadow-md rounded-lg p-6",
              title: "text-2xl font-bold mb-4",
              subtitle: "text-gray-600 mb-6",
            },
          }}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
