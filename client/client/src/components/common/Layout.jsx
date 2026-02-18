import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import EmailVerificationModal from "./EmailVerificationModal";
import Header from "./Header";

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [showEmailModal, setShowEmailModal] = useState(false);

  React.useEffect(() => {
    if (user && !user.isEmailVerified) {
      const timer = setTimeout(() => {
        setShowEmailModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-20">{children}</main>

      <EmailVerificationModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </div>
  );
};

export default Layout;
