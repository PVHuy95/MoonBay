import React from "react";
import "../../../css/css_of_staff/StaffFooter.css"; // Import CSS tùy chỉnh

const StaffFooter = () => {
  return (
    <footer className="staff-footer bg-dark text-white text-center py-3">
      <p className="mb-0">
        &copy; {new Date().getFullYear()} MoonBay. All Rights Reserved.
      </p>
    </footer>
  );
};

export default StaffFooter;