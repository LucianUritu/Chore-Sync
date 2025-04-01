
import React from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";

const Profile = () => {
  return (
    <div className="container max-w-md mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <ProfileHeader />
      
      {/* You can add more profile-related components here */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Notifications</span>
            <span className="text-green-500">On</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Dark Mode</span>
            <span className="text-red-500">Off</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Language</span>
            <span>English</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">App Information</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Terms of Service</span>
            <span className="text-choresync-blue">View</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Privacy Policy</span>
            <span className="text-choresync-blue">View</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
