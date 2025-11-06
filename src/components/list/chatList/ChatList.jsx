// ChatList.jsx
import { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/addUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { toast } from "react-toastify";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) {
      setChats([]);
      toast.info("Please log in to view chats.");
      return;
    }

    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        if (!res.exists()) {
          setChats([]);
          console.log("No userchats document found, creating empty chat list");
          return;
        }

        const items = res.data().chats || [];

        const promises = items.map(async (item) => {
          try {
            const userDocRef = doc(db, "users", item.receiverId);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
              console.warn(`User with ID ${item.receiverId} not found`);
              return null;
            }

            const user = userDocSnap.data();
            return { ...item, user };
          } catch (err) {
            console.error(`Error fetching user ${item.receiverId}:`, err);
            return null;
          }
        });

        const chatData = (await Promise.all(promises)).filter(Boolean);
        setChats(chatData.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
      },
      (err) => {
        console.error("Chat list error:", err);
        if (err.code === "unavailable") {
          toast.error("You are offline. Please check your connection.");
        } else if (err.code === "permission-denied") {
          toast.error("Permission denied. Please check your authentication and Firestore rules.");
        } else {
          toast.error("Failed to load chats: " + err.message);
        }
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser?.id]);

  const handleSelect = async (chat) => {
    if (!chat?.user) {
      toast.error("Invalid user data.");
      return;
    }

    if (chat.user.blocked.includes(currentUser.id)) {
      toast.warn("You are blocked by this user and cannot open this chat.");
      return;
    }

    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    if (chatIndex === -1) {
      toast.error("Chat not found.");
      return;
    }

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.error("Select chat error:", err);
      toast.error("Failed to open chat: " + err.message);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user?.username?.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="Search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredChats.length === 0 && <p>No chats found.</p>}
      {filteredChats.map((chat, index) => (
        <div
          className="item"
          key={`chat-${chat.chatId}-${chat.user?.id || 'unknown'}-${index}`}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt=""
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? "Blocked User"
                : chat.user.username || "Unknown User"}
            </span>
            <p>{chat.lastMessage || "No messages yet"}</p>
          </div>
        </div>
      ))}
      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;