// Chat.jsx
import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { toast } from "react-toastify";
import { format } from "timeago.js";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    if (!chatId) {
      setChat(null);
      return;
    }

    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      if (res.exists()) {
        setChat(res.data());
      } else {
        setChat(null);
        console.log("Chat not found, creating new chat structure");
      }
    }, (err) => {
      console.error("Chat subscription error:", err);
      if (err.code === 'permission-denied') {
        toast.error("Permission denied. Please check your authentication.");
      } else if (err.code === 'unavailable') {
        toast.error("Service unavailable. Please check your connection.");
      } else {
        toast.error("Failed to load chat: " + err.message);
      }
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (!text) return; // Prevent empty messages
    if (!currentUser?.id || !chatId) {
      toast.error("User not authenticated or chat not selected");
      return;
    }
    
    // Debug authentication
    console.log("=== DEBUG INFO ===");
    console.log("Current user:", currentUser);
    console.log("User ID:", currentUser?.id);
    console.log("Chat ID:", chatId);
    console.log("Firebase project:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
    console.log("Environment:", import.meta.env.MODE);
    console.log("Firebase API Key exists:", !!import.meta.env.VITE_FIREBASE_API_KEY);
    console.log("Firebase API Key is demo:", import.meta.env.VITE_FIREBASE_API_KEY?.includes('demo'));
    
    // Check if Firebase is properly configured
    if (import.meta.env.DEV && (!import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY.includes('demo'))) {
      toast.info("Firebase not configured. This is a demo mode - messages won't be saved.");
      setText("");
      return;
    }
    
    try {
      // First, try to read the chat document to test permissions
      console.log("Testing read permissions for chat:", chatId);
      const chatDoc = await getDoc(doc(db, "chats", chatId));
      console.log("Chat document exists:", chatDoc.exists());
      
      if (!chatDoc.exists()) {
        console.log("Chat document doesn't exist, creating it first...");
        await setDoc(doc(db, "chats", chatId), {
          messages: [],
          createdAt: new Date(),
        });
        console.log("Chat document created successfully");
      }
      
      console.log("Attempting to update chat with message...");
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        }),
      });
      console.log("Message sent successfully");

      const userIDs = [currentUser.id, user.id];

      for (const id of userIDs) {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen =
              id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      }
    } catch (err) {
      console.error("Send error:", err);
      if (err.code === 'permission-denied') {
        toast.error("Permission denied. Please check your Firebase rules or authentication status.");
      } else if (err.code === 'unavailable') {
        toast.error("Service unavailable. Please check your internet connection.");
      } else {
        toast.error("Failed to send message: " + err.message);
      }
    } finally {
      setText("");
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username || "Unknown User"}</span>
            <p>{isCurrentUserBlocked ? "You are blocked" : "Lorem ipsum dolor, sit amet."}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={`${message.senderId}-${message.createdAt?.toDate?.() || index}`}
          >
            <div className="texts">
              <p>{message.text}</p>
              <span>{format(message.createdAt.toDate())}</span>
            </div>
          </div>
        ))}
        {!chat && <p>No messages yet</p>}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          {/* Remove image upload icon */}
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;