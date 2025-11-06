// App.jsx
import { useEffect } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import AuthTest from "./components/AuthTest";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import { toast } from "react-toastify";
const App = () => {
  useEffect(() => {
    // Only initialize OneSignal in production
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isDevelopment = import.meta.env.DEV;
    
    if (isLocalhost || isDevelopment) {
      console.log("OneSignal disabled in development mode to avoid tracking prevention issues");
      return;
    }

    // Only load OneSignal in production
    const initializeOneSignal = async () => {
      try {
        // Wait for OneSignal to be available
        const checkOneSignal = () => {
          return new Promise((resolve) => {
            if (window.OneSignal) {
              resolve(true);
            } else {
              setTimeout(() => checkOneSignal().then(resolve), 100);
            }
          });
        };

        await checkOneSignal();

        if (window.OneSignal) {
          // Dynamic import for production only
          const { default: OneSignal } = await import("react-onesignal");
          
          await OneSignal.init({
            appId: import.meta.env.VITE_ONESIGNAL_APP_ID || "4f69f1dc-3e03-4a1c-9e8c-57f7601c2e0a",
            safari_web_id: import.meta.env.VITE_ONESIGNAL_SAFARI_WEB_ID || "web.onesignal.auto.6401d2fc-b951-4213-a02c-03159c046b78",
            notifyButton: {
              enable: true,
            },
            allowLocalhostAsSecureOrigin: true,
          });

          // Request notification permission
          await OneSignal.showNativePrompt();
          
          console.log("OneSignal initialized successfully");
        } else {
          console.warn("OneSignal SDK not loaded after timeout");
        }
      } catch (error) {
        console.error("OneSignal initialization error:", error);
      }
    };

    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(initializeOneSignal, 1000);
    return () => clearTimeout(timer);
  }, []);

  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserInfo(user.uid);
      } else {
        fetchUserInfo(null);
        toast.info("Please sign in to continue.");
      }
    }, (err) => {
      console.error("Auth state error:", err);
      toast.error("Authentication error: " + err.message);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
      <AuthTest />
    </div>
  );
};

export default App;